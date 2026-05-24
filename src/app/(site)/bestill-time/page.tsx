import type { Metadata } from 'next'
import Link from 'next/link'
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
        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          Timebestilling
        </p>
        <h1 className="font-serif text-display text-stone mb-4">Bestill time</h1>
        <p className="font-sans font-light text-xl text-muted mb-12 max-w-2xl">
          Velg ønsket dato og klokkeslett. Terje bekrefter timen og tar kontakt med deg.
          Du kan også ringe{' '}
          <a href={`tel:${phoneTel}`} className="text-sage-dark underline underline-offset-2">
            {phoneDisplay}
          </a>
          .
        </p>

        <BookingForm defaultPhone={settings?.phone} />

        <p className="mt-12 text-sm font-sans font-light text-muted">
          Må du avbestille?{' '}
          <Link href="/avbestill" className="text-sage-dark underline underline-offset-2">
            Gå til avbestilling
          </Link>
        </p>
      </div>
    </div>
  )
}
