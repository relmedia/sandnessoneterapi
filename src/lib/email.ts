import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'

export interface TransactionalEmailInput {
  to: string
  subject: string
  html: string
  text: string
}

function getSmtpHost(): string | null {
  return process.env.SMTP_HOST?.trim() || null
}

function getSmtpUser(): string | null {
  return process.env.SMTP_USER?.trim() || null
}

function getSmtpPass(): string | null {
  return process.env.SMTP_PASS?.trim() || null
}

export function getFromAddress(): string | null {
  return process.env.BOOKING_FROM_EMAIL?.trim() || null
}

function getSmtpPort(): number {
  const port = Number(process.env.SMTP_PORT ?? 587)
  return Number.isFinite(port) && port > 0 ? port : 587
}

function isSmtpSecure(): boolean {
  const value = process.env.SMTP_SECURE?.trim().toLowerCase()
  if (value === 'true') return true
  if (value === 'false') return false
  return getSmtpPort() === 465
}

export function isEmailConfigured(): boolean {
  return Boolean(getSmtpHost() && getSmtpUser() && getSmtpPass() && getFromAddress())
}

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter

  const host = getSmtpHost()
  const user = getSmtpUser()
  const pass = getSmtpPass()

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured.')
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: getSmtpPort(),
    secure: isSmtpSecure(),
    auth: { user, pass },
  })

  return cachedTransporter
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
  logContext = 'email'
): Promise<boolean> {
  const from = getFromAddress()

  if (!isEmailConfigured() || !from) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${logContext}] SMTP or BOOKING_FROM_EMAIL is not configured.`)
    }
    return false
  }

  try {
    await getTransporter().sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
    return true
  } catch (error) {
    console.error(`[${logContext}] Failed to send email:`, error)
    return false
  }
}
