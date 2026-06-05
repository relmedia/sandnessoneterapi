import 'server-only'

import { getPhoneDisplay } from '@/lib/utils'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email'
import { renderEmail, type DetailRow, type EmailContact } from '@/lib/email-template'
import {
  formatBookOrderStatus,
  formatShippingAddress,
  type BookOrderRecord,
} from '@/lib/book-order'
import { getVippsPaymentInstructions } from '@/lib/vipps-number'

const PUBLIC_CONTACT: EmailContact = {
  phone: '450 36 557',
  email: 'terje@sandnessoneterapi.no',
  address: 'Industrigata 1, 4307 Sandnes',
}

function formatNok(amount: number): string {
  return `${amount.toLocaleString('nb-NO')} kr`
}

export interface BookOrderEmailDetails {
  name: string
  lastName: string
  email: string
  phone: string
  bookTitle: string
  bookPrice: number
  shippingFee: number
  amountPaid?: number
  status: BookOrderRecord['status']
  addressLine1: string
  postalCode: string
  city: string
  message?: string
}

export interface BookOrderPlacedEmailDetails extends BookOrderEmailDetails {
  totalNok: number
  vippsNumber: string
}

interface BookOrderEmailContext {
  adminEmail: string
  siteName: string
  siteUrl: string
}

function getAdminEmail(fallback?: string | null): string | null {
  return (
    process.env.BOOK_ADMIN_EMAIL?.trim() ||
    process.env.COURSE_ADMIN_EMAIL?.trim() ||
    process.env.BOOKING_ADMIN_EMAIL?.trim() ||
    fallback?.trim() ||
    null
  )
}

function buildDetailsText(details: BookOrderEmailDetails): string {
  const lines = [
    `Navn: ${details.name} ${details.lastName}`,
    `E-post: ${details.email}`,
    `Telefon: ${getPhoneDisplay(details.phone)}`,
    `Bok: ${details.bookTitle}`,
    `Bokpris: ${details.bookPrice.toLocaleString('nb-NO')} kr`,
    `Frakt: ${details.shippingFee.toLocaleString('nb-NO')} kr`,
    `Leveringsadresse: ${formatShippingAddress(details)}`,
    `Status: ${formatBookOrderStatus(details.status)}`,
  ]

  if (typeof details.amountPaid === 'number') {
    lines.push(`Betalt: ${details.amountPaid.toLocaleString('nb-NO')} kr`)
  }

  if (details.message) {
    lines.push(`Melding: ${details.message}`)
  }

  return lines.join('\n')
}

async function sendEmail(input: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<boolean> {
  return sendTransactionalEmail(input, 'book-order-email')
}

function buildCustomerEmail(details: BookOrderEmailDetails, context: BookOrderEmailContext) {
  const text = [
    `Hei ${details.name},`,
    '',
    'Takk for bestillingen. Betalingen er mottatt via Vipps.',
    '',
    buildDetailsText(details),
    '',
    'Vi sender boken til adressen over så snart som mulig.',
    '',
    'Med vennlig hilsen',
    context.siteName,
  ].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Bok', value: details.bookTitle },
    { label: 'Bokpris', value: formatNok(details.bookPrice) },
    { label: 'Frakt', value: formatNok(details.shippingFee) },
  ]
  if (typeof details.amountPaid === 'number') {
    detailRows.push({ label: 'Totalt betalt', value: formatNok(details.amountPaid) })
  }
  detailRows.push({ label: 'Leveres til', value: formatShippingAddress(details) })

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `Betalingen for ${details.bookTitle} er mottatt – boken sendes snart.`,
    badge: { label: 'Betalt med Vipps', tone: 'success' },
    heading: 'Takk for bestillingen!',
    intro: [
      `Hei ${details.name}, vi har mottatt betalingen din via Vipps.`,
      'Her er en oppsummering av bestillingen din.',
    ],
    detailTitle: 'Bestilling',
    detailRows,
    outro: ['Vi sender boken til adressen over så snart som mulig.'],
    contact: PUBLIC_CONTACT,
  })

  return {
    subject: `Bekreftelse: ${details.bookTitle}`,
    html,
    text,
  }
}

function buildAdminEmail(details: BookOrderEmailDetails, context: BookOrderEmailContext) {
  const text = [
    'Ny bokbestilling (betalt via Vipps):',
    '',
    buildDetailsText(details),
    '',
    context.siteUrl,
  ].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Navn', value: `${details.name} ${details.lastName}` },
    { label: 'E-post', value: details.email },
    { label: 'Telefon', value: getPhoneDisplay(details.phone) },
    { label: 'Bok', value: details.bookTitle },
    { label: 'Bokpris', value: formatNok(details.bookPrice) },
    { label: 'Frakt', value: formatNok(details.shippingFee) },
  ]
  if (typeof details.amountPaid === 'number') {
    detailRows.push({ label: 'Totalt betalt', value: formatNok(details.amountPaid) })
  }
  detailRows.push({ label: 'Leveres til', value: formatShippingAddress(details) })
  detailRows.push({ label: 'Status', value: formatBookOrderStatus(details.status) })
  if (details.message) {
    detailRows.push({ label: 'Melding', value: details.message })
  }

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `${details.bookTitle} – ${details.name} ${details.lastName}`,
    badge: { label: 'Betalt med Vipps', tone: 'success' },
    heading: 'Ny bokbestilling',
    intro: [`${details.name} ${details.lastName} har bestilt og betalt for en bok.`],
    detailTitle: 'Bestilling',
    detailRows,
    signoff: false,
  })

  return {
    subject: `Bokbestilling: ${details.bookTitle} – ${details.name} ${details.lastName}`,
    html,
    text,
  }
}

function buildPlacedCustomerEmail(
  details: BookOrderPlacedEmailDetails,
  context: BookOrderEmailContext
) {
  const instructions = getVippsPaymentInstructions(details.totalNok, details.bookTitle)
  const text = [
    `Hei ${details.name},`,
    '',
    'Takk for bestillingen. For å fullføre, betal med Vipps:',
    '',
    ...instructions.map((step, index) => `${index + 1}. ${step}`),
    '',
    buildDetailsText(details),
    '',
    'Vi sender boken når betalingen er mottatt.',
    '',
    'Med vennlig hilsen',
    context.siteName,
  ].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Bok', value: details.bookTitle },
    { label: 'Bokpris', value: formatNok(details.bookPrice) },
    { label: 'Frakt', value: formatNok(details.shippingFee) },
    { label: 'Totalt å betale', value: formatNok(details.totalNok) },
    { label: 'Vippsnummer', value: details.vippsNumber },
    { label: 'Leveres til', value: formatShippingAddress(details) },
  ]

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `Betal ${formatNok(details.totalNok)} til ${details.vippsNumber} for å fullføre bestillingen.`,
    badge: { label: 'Venter betaling', tone: 'pending' },
    heading: 'Fullfør betalingen med Vipps',
    intro: [
      `Hei ${details.name}, takk for bestillingen.`,
      `Betal ${formatNok(details.totalNok)} til ${details.vippsNumber} i Vipps-appen for at vi skal sende boken.`,
    ],
    detailTitle: 'Bestilling',
    detailRows,
    highlight: {
      title: 'Slik betaler du',
      description: instructions.join(' '),
    },
    outro: ['Vi sender boken til adressen over når betalingen er mottatt.'],
    contact: PUBLIC_CONTACT,
  })

  return {
    subject: `Fullfør betaling: ${details.bookTitle}`,
    html,
    text,
  }
}

function buildPlacedAdminEmail(
  details: BookOrderPlacedEmailDetails,
  context: BookOrderEmailContext
) {
  const text = [
    `Ny bokbestilling – venter Vipps-betaling til ${details.vippsNumber}:`,
    '',
    buildDetailsText(details),
    '',
    `Forventet beløp: ${formatNok(details.totalNok)}`,
    '',
    context.siteUrl,
  ].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Navn', value: `${details.name} ${details.lastName}` },
    { label: 'E-post', value: details.email },
    { label: 'Telefon', value: getPhoneDisplay(details.phone) },
    { label: 'Bok', value: details.bookTitle },
    { label: 'Totalt', value: formatNok(details.totalNok) },
    { label: 'Vippsnummer', value: details.vippsNumber },
    { label: 'Leveres til', value: formatShippingAddress(details) },
    { label: 'Status', value: formatBookOrderStatus(details.status) },
  ]
  if (details.message) {
    detailRows.push({ label: 'Melding', value: details.message })
  }

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `${details.bookTitle} – ${details.name} ${details.lastName}`,
    badge: { label: 'Venter betaling', tone: 'pending' },
    heading: 'Ny bokbestilling',
    intro: [
      `${details.name} ${details.lastName} har bestilt en bok og skal betale ${formatNok(details.totalNok)} til ${details.vippsNumber}.`,
    ],
    detailTitle: 'Detaljer',
    detailRows,
    signoff: false,
  })

  return {
    subject: `Bokbestilling (venter Vipps): ${details.bookTitle} – ${details.name} ${details.lastName}`,
    html,
    text,
  }
}

export function isBookOrderEmailConfigured(): boolean {
  return isEmailConfigured() && Boolean(getAdminEmail())
}

export async function sendBookOrderEmails(
  details: BookOrderEmailDetails,
  context: { siteName?: string; siteUrl: string; adminEmail?: string | null }
): Promise<void> {
  if (!isEmailConfigured()) return

  const adminEmail = getAdminEmail(context.adminEmail)
  const siteName = context.siteName ?? 'Sandnes Soneterapi'
  const emailContext: BookOrderEmailContext = {
    adminEmail: adminEmail ?? '',
    siteName,
    siteUrl: context.siteUrl,
  }

  const customerEmail = buildCustomerEmail(details, emailContext)

  await sendEmail({
    to: details.email,
    subject: customerEmail.subject,
    html: customerEmail.html,
    text: customerEmail.text,
  })

  if (adminEmail) {
    const adminEmailContent = buildAdminEmail(details, emailContext)
    await sendEmail({
      to: adminEmail,
      subject: adminEmailContent.subject,
      html: adminEmailContent.html,
      text: adminEmailContent.text,
    })
  }
}

export async function sendBookOrderPlacedEmails(
  details: BookOrderPlacedEmailDetails,
  context: { siteName?: string; siteUrl: string; adminEmail?: string | null }
): Promise<void> {
  if (!isEmailConfigured()) return

  const adminEmail = getAdminEmail(context.adminEmail)
  const siteName = context.siteName ?? 'Sandnes Soneterapi'
  const emailContext: BookOrderEmailContext = {
    adminEmail: adminEmail ?? '',
    siteName,
    siteUrl: context.siteUrl,
  }

  const customerEmail = buildPlacedCustomerEmail(details, emailContext)

  await sendEmail({
    to: details.email,
    subject: customerEmail.subject,
    html: customerEmail.html,
    text: customerEmail.text,
  })

  if (adminEmail) {
    const adminEmailContent = buildPlacedAdminEmail(details, emailContext)
    await sendEmail({
      to: adminEmail,
      subject: adminEmailContent.subject,
      html: adminEmailContent.html,
      text: adminEmailContent.text,
    })
  }
}
