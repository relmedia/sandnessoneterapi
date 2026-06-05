import 'server-only'

import { Resend } from 'resend'

export interface TransactionalEmailInput {
  to: string
  subject: string
  html: string
  text: string
}

function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null
}

export function getFromAddress(): string | null {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.BOOKING_FROM_EMAIL?.trim() ||
    null
  )
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

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
  logContext = 'email'
): Promise<boolean> {
  const from = getFromAddress()

  if (!isEmailConfigured() || !from) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${logContext}] RESEND_API_KEY or EMAIL_FROM is not configured.`)
    }
    return false
  }

  try {
    const { error } = await getResendClient().emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })

    if (error) {
      console.error(`[${logContext}] Failed to send email:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`[${logContext}] Failed to send email:`, error)
    return false
  }
}
