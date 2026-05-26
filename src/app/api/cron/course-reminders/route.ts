import { NextResponse, type NextRequest } from 'next/server'
import { sendDueCourseReminders } from '@/lib/course-registration-service'

export const runtime = 'nodejs'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return process.env.NODE_ENV === 'development'

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  return handleCron(request)
}

export async function POST(request: NextRequest) {
  return handleCron(request)
}

async function handleCron(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const sentCount = await sendDueCourseReminders()

  return NextResponse.json({
    ok: true,
    sentCount,
  })
}
