import 'server-only'

import { Resend } from 'resend'

export interface TransactionalEmailInput {
  to: string
  subject: string
  html: string
  text: string
}

const EMAIL_ADDRESS_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const DEFAULT_SENDER_NAME = 'Sandnes Soneterapi'

function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null
}

function cleanEnvValue(value: string): string {
  return value
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/^["']+|["']+$/g, '')
    .replace(/\r/g, '')
    .trim()
}

function isValidEmail(value: string): boolean {
  return EMAIL_ADDRESS_PATTERN.test(value)
}

function extractEmail(value: string): string | null {
  const cleaned = cleanEnvValue(value)
  if (!cleaned) return null

  const namedMatch = cleaned.match(/^(.+?)\s*<([^>]+)>$/)
  if (namedMatch) {
    const email = cleanEnvValue(namedMatch[2])
    return isValidEmail(email) ? email : null
  }

  return isValidEmail(cleaned) ? cleaned : null
}

function resolveFromAddress(): { email: string; name: string } | null {
  const adminEmail = getAdminEmailForFrom()
  const explicit = cleanEnvValue(
    process.env.EMAIL_FROM ?? process.env.BOOKING_FROM_EMAIL ?? '',
  )

  if (explicit) {
    const namedMatch = explicit.match(/^(.+?)\s*<([^>]+)>$/)
    if (namedMatch) {
      const email = cleanEnvValue(namedMatch[2])
      const name = cleanEnvValue(namedMatch[1]) || DEFAULT_SENDER_NAME
      if (isValidEmail(email)) {
        return { email, name }
      }
    }

    if (isValidEmail(explicit)) {
      return { email: explicit, name: DEFAULT_SENDER_NAME }
    }

    if (!explicit.includes('@') && adminEmail) {
      return { email: adminEmail, name: explicit }
    }
  }

  if (adminEmail) {
    return { email: adminEmail, name: DEFAULT_SENDER_NAME }
  }

  return null
}

function getAdminEmailForFrom(): string | null {
  for (const key of [
    'BOOKING_ADMIN_EMAIL',
    'COURSE_ADMIN_EMAIL',
    'BOOK_ADMIN_EMAIL',
  ] as const) {
    const email = extractEmail(process.env[key] ?? '')
    if (email) return email
  }

  return null
}

export function getFromAddress(): string | null {
  const resolved = resolveFromAddress()
  if (!resolved) return null

  const { email, name } = resolved
  return name ? `${name} <${email}>` : email
}

export function normalizeRecipientAddress(raw: string): string | null {
  return extractEmail(raw)
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey() && getFromAddress())
}

let cachedResend: Resend | null = null

function getResendClient(): Resend {
  const apiKey = getResendApiKey()
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.')
  }

  if (!cachedResend) {
    cachedResend = new Resend(apiKey)
  }

  return cachedResend
}

function describeAddress(value: string): string {
  const email = extractEmail(value)
  if (!email) return JSON.stringify(value)
  const [local, domain] = email.split('@')
  return `${local.slice(0, 2)}…@${domain}`
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
  logContext = 'email'
): Promise<boolean> {
  const from = getFromAddress()
  const to = normalizeRecipientAddress(input.to)

  if (!getResendApiKey()) {
    console.warn(`[${logContext}] Email not sent – missing RESEND_API_KEY.`)
    return false
  }

  if (!from || !from.includes('@')) {
    console.warn(
      `[${logContext}] Email not sent – invalid sender. Set EMAIL_FROM to "Navn <e-post@domene.no>" or set BOOKING_ADMIN_EMAIL.`,
    )
    return false
  }

  if (!to) {
    console.error(
      `[${logContext}] Email not sent – invalid recipient address: ${JSON.stringify(input.to)}`,
    )
    return false
  }

  try {
    const { error } = await getResendClient().emails.send({
      from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })

    if (error) {
      console.error(`[${logContext}] Failed to send email:`, error)
      console.error(
        `[${logContext}] Address debug – from: ${describeAddress(from)}, to: ${describeAddress(to)}`,
      )
      return false
    }

    return true
  } catch (error) {
    console.error(`[${logContext}] Failed to send email:`, error)
    return false
  }
}
