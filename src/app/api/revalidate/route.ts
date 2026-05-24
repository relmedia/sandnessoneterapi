import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { SANITY_CACHE_TAG } from '@/lib/revalidate'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Revalidation not configured' }, { status: 501 })
  }

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  revalidateTag(SANITY_CACHE_TAG, { expire: 0 })

  return NextResponse.json({ revalidated: true, tag: SANITY_CACHE_TAG })
}
