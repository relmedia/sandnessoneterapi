import 'server-only'

import { formatDateNb, getPhoneDisplay } from '@/lib/utils'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email'
import { renderEmail, type DetailRow, type EmailContact } from '@/lib/email-template'

const PUBLIC_CONTACT: EmailContact = {
  phone: '450 36 557',
  email: 'terje@sandnessoneterapi.no',
  address: 'Industrigata 1, 4307 Sandnes',
}

export interface BookingEmailDetails {
  name: string
  lastName: string
  email: string
  phone: string
  serviceLabel: string
  date: string
  time: string
  message?: string
  cancelToken: string
}

interface BookingEmailContext {
  adminEmail?: string | null
  siteName: string
  siteUrl: string
}

function formatBookingDate(date: string): string {
  return formatDateNb(date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildCancelUrl(siteUrl: string, cancelToken: string): string {
  return `${siteUrl.replace(/\/$/, '')}/avbestill?token=${encodeURIComponent(cancelToken)}`
}

function buildDetailsText(booking: BookingEmailDetails): string {
  const lines = [
    `Navn: ${booking.name} ${booking.lastName}`,
    `E-post: ${booking.email}`,
    `Telefon: ${getPhoneDisplay(booking.phone)}`,
    `Behandling: ${booking.serviceLabel}`,
    `Dato: ${formatBookingDate(booking.date)}`,
    `Klokkeslett: ${booking.time}`,
  ]

  if (booking.message) {
    lines.push(`Melding: ${booking.message}`)
  }

  return lines.join('\n')
}

function buildCustomerEmail(booking: BookingEmailDetails, context: BookingEmailContext) {
  const cancelUrl = buildCancelUrl(context.siteUrl, booking.cancelToken)
  const details = buildDetailsText(booking)

  const text = [
    `Hei ${booking.name},`,
    '',
    `Takk for timebestillingen hos ${context.siteName}. Vi har mottatt forespørselen din:`,
    '',
    details,
    '',
    'Terje tar kontakt for å bekrefte timen.',
    '',
    'Avbestillingskode:',
    booking.cancelToken,
    '',
    `Avbestill online: ${cancelUrl}`,
    '',
    `Med vennlig hilsen`,
    context.siteName,
  ].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Behandling', value: booking.serviceLabel },
    { label: 'Dato', value: formatBookingDate(booking.date) },
    { label: 'Klokkeslett', value: booking.time },
  ]
  if (booking.message) {
    detailRows.push({ label: 'Melding', value: booking.message })
  }

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `Vi har mottatt timebestillingen din – ${formatBookingDate(booking.date)} kl. ${booking.time}.`,
    badge: { label: 'Venter bekreftelse', tone: 'pending' },
    heading: 'Timebestilling mottatt',
    intro: [
      `Hei ${booking.name}, takk for timebestillingen hos ${context.siteName}.`,
      'Vi har mottatt forespørselen din, og Terje tar kontakt for å bekrefte timen.',
    ],
    detailTitle: 'Din time',
    detailRows,
    highlight: {
      title: 'Avbestilling',
      description: 'Lagre denne koden eller lenken dersom du må avlyse timen senere.',
      code: booking.cancelToken,
      link: { label: 'Avbestill timen online', url: cancelUrl },
    },
    contact: PUBLIC_CONTACT,
  })

  return {
    subject: `Timebestilling mottatt – ${context.siteName}`,
    text,
    html,
  }
}

function buildAdminEmail(booking: BookingEmailDetails, context: BookingEmailContext) {
  const cancelUrl = buildCancelUrl(context.siteUrl, booking.cancelToken)
  const details = buildDetailsText(booking)

  const text = [
    'Ny timebestilling mottatt:',
    '',
    details,
    '',
    `Avbestillingskode: ${booking.cancelToken}`,
    `Avbestillingslenke: ${cancelUrl}`,
  ].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Navn', value: `${booking.name} ${booking.lastName}` },
    { label: 'E-post', value: booking.email },
    { label: 'Telefon', value: getPhoneDisplay(booking.phone) },
    { label: 'Behandling', value: booking.serviceLabel },
    { label: 'Dato', value: formatBookingDate(booking.date) },
    { label: 'Klokkeslett', value: booking.time },
  ]
  if (booking.message) {
    detailRows.push({ label: 'Melding', value: booking.message })
  }

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `${booking.name} ${booking.lastName} – ${booking.serviceLabel}`,
    badge: { label: 'Ny timebestilling', tone: 'info' },
    heading: 'Ny timebestilling',
    intro: [`${booking.name} ${booking.lastName} har sendt inn en timebestilling.`],
    detailTitle: 'Detaljer',
    detailRows,
    highlight: {
      title: 'Avbestilling',
      code: booking.cancelToken,
      link: { label: 'Åpne avbestillingslenke', url: cancelUrl },
    },
    signoff: false,
  })

  return {
    subject: `Ny timebestilling – ${booking.name} ${booking.lastName}`,
    text,
    html,
  }
}

async function sendEmail(input: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<boolean> {
  return sendTransactionalEmail(input, 'booking-email')
}

export async function sendBookingConfirmationEmails(
  booking: BookingEmailDetails,
  context: BookingEmailContext
): Promise<{ customerSent: boolean; adminSent: boolean }> {
  const customerEmail = buildCustomerEmail(booking, context)

  const customerSent = await sendEmail({
    to: booking.email,
    subject: customerEmail.subject,
    html: customerEmail.html,
    text: customerEmail.text,
  })

  let adminSent = false
  const adminRecipient = context.adminEmail?.trim()

  if (adminRecipient) {
    const adminEmailContent = buildAdminEmail(booking, context)
    adminSent = await sendEmail({
      to: adminRecipient,
      subject: adminEmailContent.subject,
      html: adminEmailContent.html,
      text: adminEmailContent.text,
    })
  }

  return { customerSent, adminSent }
}

export function isBookingEmailConfigured(): boolean {
  return isEmailConfigured()
}
