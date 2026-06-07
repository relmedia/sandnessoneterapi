import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { BookingForm } from '@/components/BookingForm'
import { getSiteSettings } from '@/lib/sanity'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Bestill time',
  description: 'Bestill time for soneterapi, øreakupunktur eller tankefeltterapi hos Terje Horpestad i Sandnes.',
}

export default async function BestillTimePage() {
  const settings = await getSiteSettings()
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <div className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto">
        <div className="mb-10 md:mb-14">
          <p className="mb-3 text-label">
            Timebestilling
          </p>
          <h1 className="mb-4 text-heading-display">Bestill time</h1>
          <p className="max-w-2xl text-body-lg">
            Velg en ledig dato og klokkeslett. Terje bekrefter timen og tar kontakt med deg.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-stone/10 bg-sage-light/30 px-5 py-4">
            <p className="mb-1 font-sans text-xs uppercase tracking-widest text-sage">Ring oss</p>
            <a
              href={`tel:${phoneTel}`}
              className="inline-flex items-center gap-2 font-sans text-stone transition-colors hover:text-sage-dark"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              {phoneDisplay}
            </a>
          </div>
          <div className="rounded-xl border border-stone/10 bg-cream/60 px-5 py-4">
            <p className="mb-1 font-sans text-xs uppercase tracking-widest text-sage">Avbestilling</p>
            <Link
              href="/avbestill"
              className="font-sans text-sm font-normal text-stone underline-offset-2 hover:text-sage-dark hover:underline"
            >
              Gå til avbestilling
            </Link>
          </div>
        </div>

        <BookingForm />
      </div>
    </div>
  )
}
