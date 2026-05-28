import 'server-only'

import { handleBookOrderVippsWebhook } from '@/lib/book-order-service'
import { handleCourseRegistrationVippsWebhook } from '@/lib/course-registration-service'
import type { VippsWebhookEvent } from '@/lib/vipps'

export async function handleVippsWebhookEvent(event: VippsWebhookEvent): Promise<void> {
  if (event.reference.startsWith('book-')) {
    await handleBookOrderVippsWebhook(event)
    return
  }

  await handleCourseRegistrationVippsWebhook(event)
}
