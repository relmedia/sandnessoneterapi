import 'server-only'

import { createHmac, createHash, randomUUID } from 'node:crypto'

const DEFAULT_TEST_BASE_URL = 'https://apitest.vipps.no'
const DEFAULT_PROD_BASE_URL = 'https://api.vipps.no'

export interface VippsConfig {
  clientId: string
  clientSecret: string
  subscriptionKey: string
  merchantSerialNumber: string
  baseUrl: string
  systemName: string
  systemVersion: string
  pluginName: string
  pluginVersion: string
}

export interface VippsAmount {
  currency: 'NOK'
  value: number
}

export interface VippsCreatePaymentInput {
  reference: string
  amountOre: number
  phoneNumber: string
  paymentDescription: string
  returnUrl: string
}

export interface VippsCreatePaymentResult {
  reference: string
  redirectUrl: string
  pspReference?: string
}

export interface VippsPaymentDetails {
  reference: string
  state: string
  amount?: VippsAmount
  pspReference?: string
}

export interface VippsWebhookEvent {
  msn: string
  reference: string
  pspReference: string
  name: string
  amount: VippsAmount
  timestamp: string
  success: boolean
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null

export function getVippsConfig(): VippsConfig | null {
  const clientId = process.env.VIPPS_CLIENT_ID?.trim()
  const clientSecret = process.env.VIPPS_CLIENT_SECRET?.trim()
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY?.trim()
  const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER?.trim()

  if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
    return null
  }

  const baseUrl =
    process.env.VIPPS_API_BASE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? DEFAULT_PROD_BASE_URL : DEFAULT_TEST_BASE_URL)

  return {
    clientId,
    clientSecret,
    subscriptionKey,
    merchantSerialNumber,
    baseUrl: baseUrl.replace(/\/$/, ''),
    systemName: process.env.VIPPS_SYSTEM_NAME?.trim() || 'Sandnes Soneterapi',
    systemVersion: process.env.VIPPS_SYSTEM_VERSION?.trim() || '1.0.0',
    pluginName: process.env.VIPPS_PLUGIN_NAME?.trim() || 'sandnes-soneterapi',
    pluginVersion: process.env.VIPPS_PLUGIN_VERSION?.trim() || '1.0.0',
  }
}

export function isVippsConfigured(): boolean {
  return getVippsConfig() !== null
}

export function getVippsWebhookSecret(): string | null {
  return process.env.VIPPS_WEBHOOK_SECRET?.trim() || null
}

export function formatPhoneForVipps(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('47') && digits.length >= 10) return digits
  if (digits.length === 8) return `47${digits}`
  return digits
}

function createPrefixedPaymentReference(prefix: string, documentId: string): string {
  const sanitized = documentId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 32)
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12)
  const reference = `${prefix}-${sanitized}-${suffix}`.slice(0, 64)
  return reference.length >= 8 ? reference : `${prefix}-${suffix}`.slice(0, 64)
}

export function createVippsPaymentReference(registrationId: string): string {
  return createPrefixedPaymentReference('course', registrationId)
}

export function createBookPaymentReference(orderId: string): string {
  return createPrefixedPaymentReference('book', orderId)
}

function getSystemHeaders(config: VippsConfig): Record<string, string> {
  return {
    'Vipps-System-Name': config.systemName,
    'Vipps-System-Version': config.systemVersion,
    'Vipps-System-Plugin-Name': config.pluginName,
    'Vipps-System-Plugin-Version': config.pluginVersion,
  }
}

async function getAccessToken(config: VippsConfig): Promise<string> {
  const now = Date.now()
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.token
  }

  const response = await fetch(`${config.baseUrl}/accesstoken/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Merchant-Serial-Number': config.merchantSerialNumber,
      ...getSystemHeaders(config),
    },
    body: '',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Vipps access token failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as {
    access_token?: string
    expires_in?: string | number
  }

  if (!data.access_token) {
    throw new Error('Vipps access token response missing access_token.')
  }

  const expiresInSeconds = Number(data.expires_in ?? 3600)
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + expiresInSeconds * 1000,
  }

  return data.access_token
}

async function vippsRequest<T>(
  config: VippsConfig,
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const accessToken = await getAccessToken(config)
  const { idempotencyKey, headers, ...rest } = init

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Merchant-Serial-Number': config.merchantSerialNumber,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...getSystemHeaders(config),
      ...headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Vipps request failed (${response.status}) ${path}: ${body}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return (await response.json()) as T
}

export async function createVippsPayment(
  input: VippsCreatePaymentInput
): Promise<VippsCreatePaymentResult> {
  const config = getVippsConfig()
  if (!config) {
    throw new Error('Vipps is not configured.')
  }

  const data = await vippsRequest<{
    reference?: string
    redirectUrl?: string
    pspReference?: string
  }>(config, '/epayment/v1/payments', {
    method: 'POST',
    idempotencyKey: randomUUID(),
    body: JSON.stringify({
      amount: {
        currency: 'NOK',
        value: input.amountOre,
      },
      paymentMethod: {
        type: 'WALLET',
      },
      customer: {
        phoneNumber: formatPhoneForVipps(input.phoneNumber),
      },
      reference: input.reference,
      returnUrl: input.returnUrl,
      userFlow: 'WEB_REDIRECT',
      paymentDescription: input.paymentDescription.slice(0, 100),
    }),
  })

  if (!data.redirectUrl) {
    throw new Error('Vipps payment response missing redirectUrl.')
  }

  return {
    reference: data.reference ?? input.reference,
    redirectUrl: data.redirectUrl,
    pspReference: data.pspReference,
  }
}

export async function getVippsPayment(reference: string): Promise<VippsPaymentDetails> {
  const config = getVippsConfig()
  if (!config) {
    throw new Error('Vipps is not configured.')
  }

  const data = await vippsRequest<{
    reference?: string
    state?: string
    amount?: VippsAmount
    pspReference?: string
  }>(config, `/epayment/v1/payments/${encodeURIComponent(reference)}`, {
    method: 'GET',
  })

  return {
    reference: data.reference ?? reference,
    state: data.state ?? 'UNKNOWN',
    amount: data.amount,
    pspReference: data.pspReference,
  }
}

export async function captureVippsPayment(
  reference: string,
  amountOre: number
): Promise<void> {
  const config = getVippsConfig()
  if (!config) {
    throw new Error('Vipps is not configured.')
  }

  await vippsRequest(config, `/epayment/v1/payments/${encodeURIComponent(reference)}/capture`, {
    method: 'POST',
    idempotencyKey: randomUUID(),
    body: JSON.stringify({
      modificationAmount: {
        currency: 'NOK',
        value: amountOre,
      },
    }),
  })
}

export async function refundVippsPayment(
  reference: string,
  amountOre: number
): Promise<void> {
  const config = getVippsConfig()
  if (!config) {
    throw new Error('Vipps is not configured.')
  }

  await vippsRequest(config, `/epayment/v1/payments/${encodeURIComponent(reference)}/refund`, {
    method: 'POST',
    idempotencyKey: randomUUID(),
    body: JSON.stringify({
      modificationAmount: {
        currency: 'NOK',
        value: amountOre,
      },
    }),
  })
}

export function verifyVippsWebhookRequest(input: {
  method: string
  pathAndQuery: string
  host: string
  dateHeader: string
  contentSha256Header: string
  authorizationHeader: string
  body: string
  secret: string
}): boolean {
  const expectedContentHash = createHash('sha256').update(input.body).digest('base64')
  if (expectedContentHash !== input.contentSha256Header) {
    return false
  }

  const signedString = `${input.method}\n${input.pathAndQuery}\n${input.dateHeader};${input.host};${input.contentSha256Header}`
  const expectedSignature = createHmac('sha256', input.secret)
    .update(signedString)
    .digest('base64')
  const expectedAuth = `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${expectedSignature}`

  return expectedAuth === input.authorizationHeader
}

export function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sandnessoneterapi.no').replace(/\/$/, '')
}
