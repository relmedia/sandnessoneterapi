import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { confirmRegistrationPayment } from '@/lib/course-registration-service'
import { buildSessionLabelFromParts } from '@/lib/course-registration-email'
import { client, getCourse } from '@/lib/sanity'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ reference?: string }>
}

export default async function CourseRegistrationSuccessPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { reference } = await searchParams

  const course = await getCourse(slug)
  if (!course) notFound()

  let confirmed = false
  let sessionLabel: string | null = null

  if (reference) {
    confirmed = await confirmRegistrationPayment(reference)

    if (confirmed) {
      const registration = await client.fetch<{
        sessionDate: string
        sessionEndDate?: string
        sessionStartTime?: string
        sessionEndTime?: string
      } | null>(
        `*[_type == "courseRegistration" && vippsPaymentReference == $reference][0]{
          sessionDate, sessionEndDate, sessionStartTime, sessionEndTime
        }`,
        { reference }
      )

      if (registration) {
        sessionLabel = buildSessionLabelFromParts(registration)
      }
    }
  }

  return (
    <article className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto max-w-2xl">
        <div className="rounded-2xl border border-stone/10 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-6 flex items-center gap-3 text-sage-dark">
            <CheckCircle2 className="size-8 shrink-0" aria-hidden />
            <h1 className="font-serif text-3xl text-stone">
              {confirmed ? 'Påmelding bekreftet' : 'Takk for påmeldingen'}
            </h1>
          </div>

          <p className="font-sans text-base font-light leading-relaxed text-muted">
            {confirmed
              ? `Betalingen for ${course.title} er mottatt via Vipps. Du får bekreftelse på e-post med detaljer om kurset.`
              : `Vi behandler Vipps-betalingen for ${course.title}. Du får bekreftelse på e-post så snart betalingen er registrert.`}
          </p>

          {sessionLabel && (
            <p className="mt-4 font-sans text-sm font-light text-stone">{sessionLabel}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/kurs/${slug}`}
              className="inline-flex rounded-full bg-stone px-6 py-3 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              Tilbake til kurset
            </Link>
            <Link
              href="/kurs"
              className="inline-flex rounded-full border border-stone/20 px-6 py-3 font-sans text-sm font-light tracking-wide text-stone transition-colors hover:border-sage hover:text-sage-dark"
            >
              Se alle kurs
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
