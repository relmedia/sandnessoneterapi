import 'server-only'

import { formatCourseSession, formatDateNb, getPhoneDisplay } from '@/lib/utils'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email'
import { renderEmail, type DetailRow, type EmailContact } from '@/lib/email-template'
import type { CourseRegistrationStatus } from '@/lib/course-registration'
import { formatRegistrationStatus } from '@/lib/course-registration'

const PUBLIC_CONTACT: EmailContact = {
  phone: '450 36 557',
  email: 'terje@sandnessoneterapi.no',
  address: 'Industrigata 1, 4307 Sandnes',
}

function formatNok(amount: number): string {
  return `${amount.toLocaleString('nb-NO')} kr`
}

function buildCourseDetailRows(details: CourseRegistrationEmailDetails): DetailRow[] {
  const rows: DetailRow[] = [
    { label: 'Kurs', value: details.courseTitle },
    { label: 'Dato', value: details.sessionLabel },
  ]
  if (typeof details.amountPaid === 'number') {
    rows.push({ label: 'Betalt', value: formatNok(details.amountPaid) })
  }
  if (details.waitlistPosition) {
    rows.push({ label: 'Ventelistenummer', value: String(details.waitlistPosition) })
  }
  return rows
}

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

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `Plassen din på ${details.courseTitle} er bekreftet.`,
    badge: { label: 'Plass bekreftet', tone: 'success' },
    heading: 'Påmelding bekreftet',
    intro: [
      `Hei ${details.name}, takk for påmeldingen.`,
      'Plassen din er bekreftet, og vi gleder oss til å se deg på kurset.',
    ],
    detailTitle: 'Kursdetaljer',
    detailRows: buildCourseDetailRows(details),
    highlight: cancelUrl
      ? {
          title: 'Avbestilling',
          description: 'Får du ikke deltatt likevel? Du kan avbestille påmeldingen her.',
          link: { label: 'Avbestill påmeldingen', url: cancelUrl },
        }
      : undefined,
    contact: PUBLIC_CONTACT,
  })

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

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `Du står nå på ventelisten for ${details.courseTitle}.`,
    badge: { label: 'På venteliste', tone: 'pending' },
    heading: 'Du står på ventelisten',
    intro: [
      `Hei ${details.name}, takk for interessen.`,
      'Kurset er dessverre fullt, men du står nå på ventelisten.',
    ],
    detailTitle: 'Kursdetaljer',
    detailRows: buildCourseDetailRows(details),
    outro: ['Blir en plass ledig, sender vi deg automatisk en Vipps-lenke for betaling.'],
    contact: PUBLIC_CONTACT,
  })

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

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `En plass er ledig på ${details.courseTitle} – fullfør betalingen innen 30 minutter.`,
    badge: { label: 'Plass ledig', tone: 'success' },
    heading: 'En plass har blitt ledig!',
    intro: [
      `Hei ${details.name}, gode nyheter – en plass har blitt ledig.`,
      'Fullfør betalingen med Vipps innen 30 minutter for å sikre plassen din.',
    ],
    detailTitle: 'Kursdetaljer',
    detailRows: buildCourseDetailRows(details),
    button: details.checkoutUrl
      ? { label: 'Betal med Vipps', url: details.checkoutUrl, variant: 'vipps' }
      : undefined,
    contact: PUBLIC_CONTACT,
  })

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

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `Påminnelse: ${details.courseTitle} starter ${lead}.`,
    badge: { label: 'Påminnelse', tone: 'info' },
    heading: `Kurset starter ${lead}`,
    intro: [
      `Hei ${details.name}, dette er en vennlig påminnelse om at kurset ditt starter ${lead}.`,
    ],
    detailTitle: 'Kursdetaljer',
    detailRows: [
      { label: 'Kurs', value: details.courseTitle },
      { label: 'Dato', value: details.sessionLabel },
    ],
    contact: PUBLIC_CONTACT,
  })

  return {
    subject: `Påminnelse: ${details.courseTitle} starter ${lead}`,
    text,
    html,
  }
}

function buildAdminEmail(details: CourseRegistrationEmailDetails, context: CourseEmailContext) {
  const text = ['Ny kurspåmelding:', '', buildDetailsText(details)].join('\n')

  const detailRows: DetailRow[] = [
    { label: 'Navn', value: `${details.name} ${details.lastName}` },
    { label: 'E-post', value: details.email },
    { label: 'Telefon', value: getPhoneDisplay(details.phone) },
    { label: 'Kurs', value: details.courseTitle },
    { label: 'Dato', value: details.sessionLabel },
    { label: 'Status', value: formatRegistrationStatus(details.status) },
  ]
  if (typeof details.amountPaid === 'number') {
    detailRows.push({ label: 'Betalt', value: formatNok(details.amountPaid) })
  }
  if (details.waitlistPosition) {
    detailRows.push({ label: 'Ventelistenummer', value: String(details.waitlistPosition) })
  }
  if (details.message) {
    detailRows.push({ label: 'Melding', value: details.message })
  }

  const html = renderEmail({
    siteName: context.siteName,
    siteUrl: context.siteUrl,
    preheader: `${details.name} ${details.lastName} – ${details.courseTitle}`,
    badge: { label: 'Ny påmelding', tone: 'info' },
    heading: 'Ny kurspåmelding',
    intro: [`${details.name} ${details.lastName} har meldt seg på et kurs.`],
    detailTitle: 'Detaljer',
    detailRows,
    signoff: false,
  })

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
