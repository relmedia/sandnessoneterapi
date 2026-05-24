import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

async function disableDraftMode() {
  ;(await draftMode()).disable()
}

export async function POST() {
  await disableDraftMode()
  return NextResponse.json({ ok: true })
}

export async function GET() {
  await disableDraftMode()
  return NextResponse.redirect(new URL('/', getSiteUrl()))
}
