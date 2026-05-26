import 'server-only'

import { formatDateNb, getPhoneDisplay } from '@/lib/utils'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email'

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
  adminEmail: string
  siteName: string
  siteUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
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
    'Takk for timebestillingen hos Sandnes Soneterapi. Vi har mottatt forespørselen din:',
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

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p>Hei ${escapeHtml(booking.name)},</p>
      <p>Takk for timebestillingen hos Sandnes Soneterapi. Vi har mottatt forespørselen din:</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Navn</td><td style="padding:8px 0">${escapeHtml(`${booking.name} ${booking.lastName}`)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">E-post</td><td style="padding:8px 0">${escapeHtml(booking.email)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Telefon</td><td style="padding:8px 0">${escapeHtml(getPhoneDisplay(booking.phone))}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Behandling</td><td style="padding:8px 0">${escapeHtml(booking.serviceLabel)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Dato</td><td style="padding:8px 0">${escapeHtml(formatBookingDate(booking.date))}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Klokkeslett</td><td style="padding:8px 0">${escapeHtml(booking.time)}</td></tr>
          ${
            booking.message
              ? `<tr><td style="padding:8px 0;color:#7a6e68;vertical-align:top">Melding</td><td style="padding:8px 0">${escapeHtml(booking.message)}</td></tr>`
              : ''
          }
        </tbody>
      </table>
      <p>Terje tar kontakt for å bekrefte timen.</p>
      <div style="margin:24px 0;padding:16px;border:1px solid #ebf0ec;border-radius:12px;background:#faf7f2">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b8c76">Avbestilling</p>
        <p style="margin:0 0 12px;font-size:14px;color:#7a6e68">Lagre avbestillingskoden eller lenken hvis du må avlyse senere.</p>
        <p style="margin:0 0 12px;font-family:monospace;font-size:14px;color:#3d3530">${escapeHtml(booking.cancelToken)}</p>
        <a href="${cancelUrl}" style="color:#4e6b58">Avbestill timen online</a>
      </div>
      <p>Med vennlig hilsen<br>${escapeHtml(context.siteName)}</p>
    </div>
  `

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

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <h1 style="font-size:20px;margin:0 0 16px">Ny timebestilling</h1>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Navn</td><td style="padding:8px 0">${escapeHtml(`${booking.name} ${booking.lastName}`)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">E-post</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Telefon</td><td style="padding:8px 0"><a href="tel:${escapeHtml(booking.phone.replace(/\D/g, ''))}">${escapeHtml(getPhoneDisplay(booking.phone))}</a></td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Behandling</td><td style="padding:8px 0">${escapeHtml(booking.serviceLabel)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Dato</td><td style="padding:8px 0">${escapeHtml(formatBookingDate(booking.date))}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Klokkeslett</td><td style="padding:8px 0">${escapeHtml(booking.time)}</td></tr>
          ${
            booking.message
              ? `<tr><td style="padding:8px 0;color:#7a6e68;vertical-align:top">Melding</td><td style="padding:8px 0">${escapeHtml(booking.message)}</td></tr>`
              : ''
          }
        </tbody>
      </table>
      <p style="margin:0 0 8px"><strong>Avbestillingskode:</strong> ${escapeHtml(booking.cancelToken)}</p>
      <p style="margin:0"><a href="${cancelUrl}" style="color:#4e6b58">Avbestillingslenke</a></p>
    </div>
  `

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
  const adminEmailContent = buildAdminEmail(booking, context)

  const [customerSent, adminSent] = await Promise.all([
    sendEmail({
      to: booking.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
      text: customerEmail.text,
    }),
    sendEmail({
      to: context.adminEmail,
      subject: adminEmailContent.subject,
      html: adminEmailContent.html,
      text: adminEmailContent.text,
    }),
  ])

  return { customerSent, adminSent }
}

export function isBookingEmailConfigured(): boolean {
  return isEmailConfigured()
}
