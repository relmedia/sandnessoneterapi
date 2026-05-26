import 'server-only'

import { formatCourseSession, formatDateNb, getPhoneDisplay } from '@/lib/utils'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email'
import type { CourseRegistrationStatus } from '@/lib/course-registration'
import { formatRegistrationStatus } from '@/lib/course-registration'

export interface CourseRegistrationEmailDetails {
  name: string
  lastName: string
  email: string
  phone: string
  courseTitle: string
  sessionLabel: string
  amountPaid?: number
  status: CourseRegistrationStatus
  waitlistPosition?: number
  cancelToken?: string
  checkoutUrl?: string
  message?: string
}

interface CourseEmailContext {
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
    process.env.COURSE_ADMIN_EMAIL?.trim() ||
    process.env.BOOKING_ADMIN_EMAIL?.trim() ||
    fallback?.trim() ||
    null
  )
}

function buildCancelUrl(siteUrl: string, cancelToken: string): string {
  return `${siteUrl.replace(/\/$/, '')}/kurs/avbestill?token=${encodeURIComponent(cancelToken)}`
}

function buildDetailsText(details: CourseRegistrationEmailDetails): string {
  const lines = [
    `Navn: ${details.name} ${details.lastName}`,
    `E-post: ${details.email}`,
    `Telefon: ${getPhoneDisplay(details.phone)}`,
    `Kurs: ${details.courseTitle}`,
    `Dato: ${details.sessionLabel}`,
    `Status: ${formatRegistrationStatus(details.status)}`,
  ]

  if (typeof details.amountPaid === 'number') {
    lines.push(`Betalt: ${details.amountPaid.toLocaleString('nb-NO')} kr`)
  }

  if (details.waitlistPosition) {
    lines.push(`Ventelistenummer: ${details.waitlistPosition}`)
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
  return sendTransactionalEmail(input, 'course-registration-email')
}

function buildConfirmationCustomerEmail(
  details: CourseRegistrationEmailDetails,
  context: CourseEmailContext
) {
  const cancelUrl = details.cancelToken ? buildCancelUrl(context.siteUrl, details.cancelToken) : null
  const text = [
    `Hei ${details.name},`,
    '',
    'Takk for påmeldingen. Din plass er bekreftet:',
    '',
    buildDetailsText(details),
    '',
    'Vi gleder oss til å se deg på kurset.',
    cancelUrl ? `\nAvbestill online: ${cancelUrl}` : '',
    '',
    `Med vennlig hilsen`,
    context.siteName,
  ]
    .filter(Boolean)
    .join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p>Hei ${escapeHtml(details.name)},</p>
      <p>Takk for påmeldingen. Din plass er <strong>bekreftet</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Kurs</td><td style="padding:8px 0">${escapeHtml(details.courseTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Dato</td><td style="padding:8px 0">${escapeHtml(details.sessionLabel)}</td></tr>
          ${
            typeof details.amountPaid === 'number'
              ? `<tr><td style="padding:8px 0;color:#7a6e68">Betalt</td><td style="padding:8px 0">${escapeHtml(`${details.amountPaid.toLocaleString('nb-NO')} kr`)}</td></tr>`
              : ''
          }
        </tbody>
      </table>
      <p>Vi gleder oss til å se deg på kurset.</p>
      ${
        cancelUrl
          ? `<p style="margin-top:24px"><a href="${cancelUrl}" style="color:#4e6b58">Avbestill påmeldingen</a></p>`
          : ''
      }
      <p>Med vennlig hilsen<br>${escapeHtml(context.siteName)}</p>
    </div>
  `

  return {
    subject: `Påmelding bekreftet – ${details.courseTitle}`,
    text,
    html,
  }
}

function buildWaitlistCustomerEmail(
  details: CourseRegistrationEmailDetails,
  context: CourseEmailContext
) {
  const text = [
    `Hei ${details.name},`,
    '',
    'Takk for interessen. Kurset er fullt, men du står nå på ventelisten:',
    '',
    buildDetailsText(details),
    '',
    'Vi sender deg Vipps-lenke automatisk hvis en plass blir ledig.',
    '',
    `Med vennlig hilsen`,
    context.siteName,
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p>Hei ${escapeHtml(details.name)},</p>
      <p>Kurset er fullt, men du står nå på <strong>ventelisten</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Kurs</td><td style="padding:8px 0">${escapeHtml(details.courseTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Dato</td><td style="padding:8px 0">${escapeHtml(details.sessionLabel)}</td></tr>
          ${
            details.waitlistPosition
              ? `<tr><td style="padding:8px 0;color:#7a6e68">Ventelistenummer</td><td style="padding:8px 0">${escapeHtml(String(details.waitlistPosition))}</td></tr>`
              : ''
          }
        </tbody>
      </table>
      <p>Vi sender deg Vipps-lenke automatisk hvis en plass blir ledig.</p>
      <p>Med vennlig hilsen<br>${escapeHtml(context.siteName)}</p>
    </div>
  `

  return {
    subject: `Venteliste – ${details.courseTitle}`,
    text,
    html,
  }
}

function buildPaymentLinkCustomerEmail(
  details: CourseRegistrationEmailDetails,
  context: CourseEmailContext
) {
  const text = [
    `Hei ${details.name},`,
    '',
    'En plass har blitt ledig på kurset du står på ventelisten for.',
    '',
    buildDetailsText(details),
    '',
    details.checkoutUrl ? `Betal med Vipps her: ${details.checkoutUrl}` : '',
    '',
    `Med vennlig hilsen`,
    context.siteName,
  ]
    .filter(Boolean)
    .join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p>Hei ${escapeHtml(details.name)},</p>
      <p>En plass har blitt ledig. Fullfør betalingen med Vipps innen 30 minutter for å sikre plassen.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Kurs</td><td style="padding:8px 0">${escapeHtml(details.courseTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Dato</td><td style="padding:8px 0">${escapeHtml(details.sessionLabel)}</td></tr>
        </tbody>
      </table>
      ${
        details.checkoutUrl
          ? `<p><a href="${details.checkoutUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#3d3530;color:#faf7f2;text-decoration:none">Betal med Vipps</a></p>`
          : ''
      }
      <p>Med vennlig hilsen<br>${escapeHtml(context.siteName)}</p>
    </div>
  `

  return {
    subject: `Plass ledig – betal med Vipps for ${details.courseTitle}`,
    text,
    html,
  }
}

function buildReminderCustomerEmail(
  details: CourseRegistrationEmailDetails,
  context: CourseEmailContext,
  daysUntil: 7 | 1
) {
  const lead = daysUntil === 7 ? 'om en uke' : 'i morgen'
  const text = [
    `Hei ${details.name},`,
    '',
    `Dette er en påminnelse om at kurset ditt starter ${lead}:`,
    '',
    `${details.courseTitle}`,
    details.sessionLabel,
    '',
    `Med vennlig hilsen`,
    context.siteName,
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <p>Hei ${escapeHtml(details.name)},</p>
      <p>Dette er en påminnelse om at kurset ditt starter <strong>${lead}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="padding:8px 0;color:#7a6e68">Kurs</td><td style="padding:8px 0">${escapeHtml(details.courseTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#7a6e68">Dato</td><td style="padding:8px 0">${escapeHtml(details.sessionLabel)}</td></tr>
        </tbody>
      </table>
      <p>Med vennlig hilsen<br>${escapeHtml(context.siteName)}</p>
    </div>
  `

  return {
    subject: `Påminnelse: ${details.courseTitle} starter ${lead}`,
    text,
    html,
  }
}

function buildAdminEmail(details: CourseRegistrationEmailDetails, context: CourseEmailContext) {
  const text = ['Ny kurspåmelding:', '', buildDetailsText(details)].join('\n')
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3d3530;max-width:560px">
      <h1 style="font-size:20px;margin:0 0 16px">Ny kurspåmelding</h1>
      <pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(buildDetailsText(details))}</pre>
    </div>
  `

  return {
    subject: `Ny kurspåmelding – ${details.name} ${details.lastName}`,
    text,
    html,
  }
}

export async function sendCourseRegistrationEmails(
  details: CourseRegistrationEmailDetails,
  context: Omit<CourseEmailContext, 'adminEmail'> & { adminEmail?: string | null }
): Promise<{ customerSent: boolean; adminSent: boolean }> {
  const adminEmail = getAdminEmail(context.adminEmail)

  let customerEmail
  if (details.status === 'waitlist') {
    customerEmail = buildWaitlistCustomerEmail(details, context as CourseEmailContext)
  } else if (details.status === 'pending_payment' && details.checkoutUrl) {
    customerEmail = buildPaymentLinkCustomerEmail(details, context as CourseEmailContext)
  } else {
    customerEmail = buildConfirmationCustomerEmail(details, context as CourseEmailContext)
  }

  const adminEmailContent = buildAdminEmail(details, context as CourseEmailContext)

  const [customerSent, adminSent] = await Promise.all([
    sendEmail({
      to: details.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
      text: customerEmail.text,
    }),
    adminEmail
      ? sendEmail({
          to: adminEmail,
          subject: adminEmailContent.subject,
          html: adminEmailContent.html,
          text: adminEmailContent.text,
        })
      : Promise.resolve(false),
  ])

  return { customerSent, adminSent }
}

export async function sendCourseReminderEmail(
  details: CourseRegistrationEmailDetails,
  context: Omit<CourseEmailContext, 'adminEmail'>,
  daysUntil: 7 | 1
): Promise<boolean> {
  const email = buildReminderCustomerEmail(details, context as CourseEmailContext, daysUntil)
  return sendEmail({
    to: details.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })
}

export function buildSessionLabelFromParts(input: {
  sessionDate: string
  sessionEndDate?: string
  sessionStartTime?: string
  sessionEndTime?: string
}): string {
  return (
    formatCourseSession({
      date: input.sessionDate,
      endDate: input.sessionEndDate,
      startTime: input.sessionStartTime,
      endTime: input.sessionEndTime,
    }) ?? formatDateNb(input.sessionDate)
  )
}

export function isCourseEmailConfigured(): boolean {
  return isEmailConfigured()
}

export function getCourseAdminEmail(fallback?: string | null): string | null {
  return getAdminEmail(fallback)
}
