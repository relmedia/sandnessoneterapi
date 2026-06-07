import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import CourseCancelPage from './CourseCancelPage'
import { getSiteSettings } from '@/lib/sanity'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Avbestill kurs',
  description: 'Avbestill kurspåmelding hos Sandnes Soneterapi.',
}

export default async function CourseAvbestillPage() {
  const settings = await getSiteSettings()
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <article className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto max-w-xl">
        <Suspense fallback={<p className="text-body-sm">Laster …</p>}>
          <CourseCancelPage />
        </Suspense>

        <p className="mt-8 text-body-sm">
          Trenger du hjelp?{' '}
          <a href={`tel:${phoneTel}`} className="text-stone transition-colors hover:text-sage-dark">
            Ring {phoneDisplay}
          </a>
        </p>

        <Link
          href="/kurs"
          className="mt-4 inline-block text-body-sm transition-colors hover:text-stone"
        >
          ← Tilbake til kurs
        </Link>
      </div>
    </article>
  )
}
