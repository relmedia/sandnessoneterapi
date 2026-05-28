import 'server-only'

import { getPhoneDisplay } from '@/lib/utils'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email'
import {
  formatBookOrderStatus,
  formatShippingAddress,
  type BookOrderRecord,
} from '@/lib/book-order'

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

interface BookOrderEmailContext {
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

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p>Hei ${escapeHtml(details.name)},</p>
      <p>Takk for bestillingen. Betalingen er <strong>mottatt via Vipps</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Bok</td><td style="padding:8px 0">${escapeHtml(details.bookTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Bokpris</td><td style="padding:8px 0">${escapeHtml(`${details.bookPrice.toLocaleString('nb-NO')} kr`)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Frakt</td><td style="padding:8px 0">${escapeHtml(`${details.shippingFee.toLocaleString('nb-NO')} kr`)}</td></tr>
          ${
            typeof details.amountPaid === 'number'
              ? `<tr><td style="padding:8px 0;color:#7a6e68">Betalt</td><td style="padding:8px 0">${escapeHtml(`${details.amountPaid.toLocaleString('nb-NO')} kr`)}</td></tr>`
              : ''
          }
          <tr><td style="padding:8px 0;color:#7a6e68">Leveres til</td><td style="padding:8px 0">${escapeHtml(formatShippingAddress(details))}</td></tr>
        </tbody>
      </table>
      <p>Vi sender boken til adressen over så snart som mulig.</p>
      <p style="margin-top:32px;color:#7a6e68">Med vennlig hilsen<br>${escapeHtml(context.siteName)}</p>
    </div>
  `

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

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p><strong>Ny bokbestilling</strong> (betalt via Vipps)</p>
      <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;background:#f7f4f1;padding:16px;border-radius:12px">${escapeHtml(buildDetailsText(details))}</pre>
    </div>
  `

  return {
    subject: `Bokbestilling: ${details.bookTitle} – ${details.name} ${details.lastName}`,
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
