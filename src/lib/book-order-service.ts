import 'server-only'

import {
  getBookOrderTotalNok,
  getBookShippingFeeNok,
  isBookOrderOnline,
  type BookOrderPayload,
  type BookOrderRecord,
} from '@/lib/book-order'
import { sendBookOrderEmails, sendBookOrderPlacedEmails } from '@/lib/book-order-email'
import {
  captureVippsPayment,
  getSiteBaseUrl,
  getVippsPayment,
  isVippsConfigured,
} from '@/lib/vipps'
import { getVippsNumberDisplay } from '@/lib/vipps-number'
import { client, getBook } from '@/lib/sanity'
import { getSanityWriteClient } from '@/lib/sanity-write'

export async function createBookOrder(input: {
  bookRef: string
  payload: BookOrderPayload
}): Promise<
  | {
      ok: true
      orderId: string
      totalNok: number
      vippsNumber: string
      status: 'pending_payment'
    }
  | { ok: false; error: string; status?: number }
> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return {
      ok: false,
      status: 503,
      error: 'Nettbestilling er ikke aktivert ennå. Ring oss for å bestille.',
    }
  }

  const book = await getBook(input.bookRef)
  if (!book) {
    return { ok: false, status: 404, error: 'Boken ble ikke funnet.' }
  }

  if (!isBookOrderOnline(book)) {
    return {
      ok: false,
      status: 409,
      error: 'Denne boken kan ikke bestilles online. Ring oss i stedet.',
    }
  }

  const bookPrice = book.price ?? 0
  const shippingFee = getBookShippingFeeNok()
  const totalNok = getBookOrderTotalNok(bookPrice, shippingFee)
  const now = new Date().toISOString()
  const vippsNumber = getVippsNumberDisplay()

  const order = await writeClient.create({
    _type: 'bookOrder',
    book: { _type: 'reference', _ref: book._id },
    bookTitle: book.title,
    bookPrice,
    shippingFee,
    name: input.payload.name,
    lastName: input.payload.lastName,
    email: input.payload.email,
    phone: input.payload.phone.replace(/\D/g, ''),
    addressLine1: input.payload.addressLine1,
    postalCode: input.payload.postalCode,
    city: input.payload.city,
    message: input.payload.message,
    status: 'pending_payment',
    createdAt: now,
  })

  const siteUrl = getSiteBaseUrl()

  await sendBookOrderPlacedEmails(
    {
      name: input.payload.name,
      lastName: input.payload.lastName,
      email: input.payload.email,
      phone: input.payload.phone,
      bookTitle: book.title,
      bookPrice,
      shippingFee,
      totalNok,
      vippsNumber,
      status: 'pending_payment',
      addressLine1: input.payload.addressLine1,
      postalCode: input.payload.postalCode,
      city: input.payload.city,
      message: input.payload.message,
    },
    {
      siteName: 'Sandnes Soneterapi',
      siteUrl,
    }
  )

  return {
    ok: true,
    orderId: order._id,
    totalNok,
    vippsNumber,
    status: 'pending_payment',
  }
}

export async function getBookOrderById(orderId: string): Promise<
  | (Pick<
      BookOrderRecord,
      | 'bookTitle'
      | 'bookPrice'
      | 'shippingFee'
      | 'status'
      | 'name'
      | 'lastName'
    > & { totalNok: number })
  | null
> {
  const order = await client.fetch<{
    bookTitle?: string
    bookPrice?: number
    shippingFee?: number
    status: BookOrderRecord['status']
    name: string
    lastName: string
  } | null>(
    `*[_type == "bookOrder" && _id == $id][0]{
      bookTitle,
      bookPrice,
      shippingFee,
      status,
      name,
      lastName
    }`,
    { id: orderId }
  )

  if (!order) return null

  const bookPrice = order.bookPrice ?? 0
  const shippingFee = order.shippingFee ?? getBookShippingFeeNok()

  return {
    ...order,
    totalNok: getBookOrderTotalNok(bookPrice, shippingFee),
  }
}

async function getBookOrderByPaymentReference(
  reference: string
): Promise<BookOrderRecord | null> {
  return client.fetch(
    `*[_type == "bookOrder" && vippsPaymentReference == $reference][0]{
      _id,
      status,
      bookTitle,
      bookPrice,
      shippingFee,
      name,
      lastName,
      email,
      phone,
      addressLine1,
      postalCode,
      city,
      message,
      amountPaid,
      vippsPaymentReference,
      vippsPspReference
    }`,
    { reference }
  )
}

async function cancelPendingBookOrder(orderId: string): Promise<void> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) return

  const order = await client.fetch<{ _id: string; status: string } | null>(
    `*[_type == "bookOrder" && _id == $id][0]{ _id, status }`,
    { id: orderId }
  )

  if (!order || order.status !== 'pending_payment') return

  await writeClient
    .patch(orderId)
    .set({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })
    .commit()
}

async function markBookOrderPaid(
  order: BookOrderRecord,
  amountPaid: number,
  pspReference?: string
): Promise<void> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) return

  const now = new Date().toISOString()

  await writeClient
    .patch(order._id)
    .set({
      status: 'paid',
      paidAt: now,
      amountPaid,
      vippsPspReference: pspReference,
    })
    .commit()

  await sendBookOrderEmails(
    {
      name: order.name,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      bookTitle: order.bookTitle ?? 'Bok',
      bookPrice: order.bookPrice ?? 0,
      shippingFee: order.shippingFee ?? getBookShippingFeeNok(),
      amountPaid,
      status: 'paid',
      addressLine1: order.addressLine1,
      postalCode: order.postalCode,
      city: order.city,
      message: order.message,
    },
    {
      siteName: 'Sandnes Soneterapi',
      siteUrl: getSiteBaseUrl(),
    }
  )
}

/** Legacy ePayment confirmation for older orders that used Vipps Checkout. */
export async function confirmBookOrderPayment(reference: string): Promise<boolean> {
  const writeClient = getSanityWriteClient()
  if (!writeClient || !isVippsConfigured()) return false

  const order = await getBookOrderByPaymentReference(reference)
  if (!order || order.status === 'paid') {
    return order?.status === 'paid'
  }

  if (order.status !== 'pending_payment') return false

  const payment = await getVippsPayment(reference)
  if (payment.state !== 'AUTHORIZED') {
    if (payment.state === 'EXPIRED' || payment.state === 'ABORTED') {
      await cancelPendingBookOrder(order._id)
    }
    return false
  }

  const amountOre = payment.amount?.value
  if (!amountOre) return false

  await captureVippsPayment(reference, amountOre)
  await markBookOrderPaid(order, amountOre / 100, payment.pspReference)
  return true
}

export async function handleBookOrderVippsWebhook(event: {
  reference: string
  name: string
  success?: boolean
}): Promise<void> {
  if (event.name === 'AUTHORIZED' && event.success !== false) {
    await confirmBookOrderPayment(event.reference)
    return
  }

  if (event.name === 'EXPIRED' || event.name === 'ABORTED') {
    const order = await getBookOrderByPaymentReference(event.reference)
    if (order) {
      await cancelPendingBookOrder(order._id)
    }
  }
}
