import { NextResponse, type NextRequest } from 'next/server'
import { handleVippsWebhookEvent } from '@/lib/vipps-webhook'
import { getVippsWebhookSecret, verifyVippsWebhookRequest, type VippsWebhookEvent } from '@/lib/vipps'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const secret = getVippsWebhookSecret()
  if (!secret) {
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 })
  }

  const body = await request.text()
  const host = request.headers.get('host') ?? ''
  const dateHeader = request.headers.get('x-ms-date') ?? ''
  const contentSha256Header = request.headers.get('x-ms-content-sha256') ?? ''
  const authorizationHeader = request.headers.get('authorization') ?? ''
  const pathAndQuery = request.nextUrl.pathname + request.nextUrl.search

  const isValid = verifyVippsWebhookRequest({
    method: 'POST',
    pathAndQuery,
    host,
    dateHeader,
    contentSha256Header,
    authorizationHeader,
    body,
    secret,
  })

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })
  }

  let event: VippsWebhookEvent

  try {
    event = JSON.parse(body) as VippsWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  try {
    await handleVippsWebhookEvent(event)
  } catch (error) {
    console.error('[vipps-webhook] Handler failed:', error)
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
