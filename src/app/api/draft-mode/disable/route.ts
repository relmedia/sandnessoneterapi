import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL('/', getSiteUrl()))
}
