import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCourse } from '@/lib/sanity'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CourseRegistrationCancelledPage({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  return (
    <article className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto max-w-2xl">
        <div className="rounded-2xl border border-stone/10 bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-heading-page">Betaling avbrutt</h1>
          <p className="mt-4 text-body-lg">
            Du fullførte ikke betalingen for {course.title}. Plassen er ikke reservert, men du kan
            prøve på nytt når du vil.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/kurs/${slug}`}
              className="inline-flex rounded-full bg-stone px-6 py-3 font-sans text-sm font-normal tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              Prøv på nytt
            </Link>
            <Link
              href="/kurs"
              className="inline-flex rounded-full border border-stone/20 px-6 py-3 font-sans text-sm font-normal tracking-wide text-stone transition-colors hover:border-sage hover:text-sage-dark"
            >
              Se alle kurs
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
