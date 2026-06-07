import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { CancelBookingForm } from '@/components/CancelBookingForm'
import { getSiteSettings } from '@/lib/sanity'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Avbestill time',
  description: 'Avbestill time hos Sandnes Soneterapi.',
}

export default async function AvbestillPage() {
  const settings = await getSiteSettings()
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <div className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto">
        <p className="text-label mb-4">
          Timebestilling
        </p>
        <h1 className="text-heading-display mb-4">Avbestill time</h1>
        <p className="text-body-lg mb-12 max-w-2xl">
          Bruk avbestillingskoden fra bestillingen, eller oppgi e-post, telefon og dato. Du kan også ringe{' '}
          <a href={`tel:${phoneTel}`} className="text-sage-dark underline underline-offset-2">
            {phoneDisplay}
          </a>
          .
        </p>

        <Suspense fallback={<p className="text-body-sm">Laster …</p>}>
          <CancelBookingForm />
        </Suspense>

        <p className="mt-12 text-sm text-body-sm">
          <Link href="/bestill-time" className="text-sage-dark underline underline-offset-2">
            Bestill ny time
          </Link>
        </p>
      </div>
    </div>
  )
}
