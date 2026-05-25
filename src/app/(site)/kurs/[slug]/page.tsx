import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getCourse, getCourses, getSiteSettings, getSanityImageAspectStyle, publishedQuery, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import {
  formatCourseDateRange,
  getGoogleMapsUrl,
  getPhoneDisplay,
  getPhoneTel,
} from '@/lib/utils'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const courses = await getCourses(publishedQuery)
  return courses.map((course) => ({ slug: course.slug.current }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug, publishedQuery)
  if (!course) return { title: 'Kurs ikke funnet' }
  return {
    title: course.title,
    description: course.shortDescription,
  }
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params
  const [course, settings] = await Promise.all([getCourse(slug), getSiteSettings()])
  if (!course) notFound()

  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)
  const dateRange = formatCourseDateRange(course.startDate, course.endDate)

  return (
    <article className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <nav
          className="mb-12 flex items-center gap-2 font-sans text-xs font-light uppercase tracking-widest text-muted"
          aria-label="Brødsmulesti"
        >
          <Link href="/" className="hover:text-stone transition-colors">
            Forside
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/kurs" className="hover:text-stone transition-colors">
            Kurs
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone">{course.title}</span>
        </nav>

        {dateRange && (
          <p className="mb-4 font-sans text-xs font-light uppercase tracking-widest text-sage">
            {dateRange}
          </p>
        )}
        <h1 className="mb-8 font-serif text-display text-stone">{course.title}</h1>

        <div className="mb-10 flex flex-wrap items-center gap-4 font-sans text-sm font-light text-muted">
          {course.location && (
            <a
              href={getGoogleMapsUrl(course.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-stone"
            >
              <MapPin className="size-4 shrink-0" aria-hidden />
              {course.location}
            </a>
          )}
          {course.price != null && (
            <span className="rounded-full border border-sage/30 px-4 py-1 text-sage-dark">
              {course.price.toLocaleString('nb-NO')} kr
            </span>
          )}
        </div>

        {course.shortDescription && (
          <p className="mb-12 max-w-3xl border-l-4 border-sage pl-6 font-sans text-xl font-light leading-relaxed text-muted">
            {course.shortDescription}
          </p>
        )}

        {course.coverImage && (
          <div
            className="relative mb-14 max-w-xl overflow-hidden rounded-2xl bg-sage-light"
            style={getSanityImageAspectStyle(course.coverImage)}
          >
            <Image
              src={urlFor(course.coverImage).width(1024).url()}
              alt={course.coverImage.alt ?? course.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {course.body && course.body.length > 0 ? (
          <PortableTextRenderer value={course.body} />
        ) : (
          course.shortDescription && (
            <p className="font-sans text-base font-light leading-relaxed text-muted">
              {course.shortDescription}
            </p>
          )
        )}

        <div className="mt-16 rounded-2xl bg-sage-light p-10 text-center">
          <h2 className="mb-3 font-serif text-2xl text-stone">Interessert i kurset?</h2>
          <p className="mb-6 font-sans font-light text-muted">
            Ta kontakt med Terje for påmelding eller spørsmål.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${phoneTel}`}
              className="inline-block rounded-full bg-sage px-8 py-4 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              Ring {phoneDisplay}
            </a>
            {settings?.email && (
              <a
                href={`mailto:${settings.email}?subject=Påmelding: ${encodeURIComponent(course.title)}`}
                className="inline-block rounded-full border border-sage/30 px-8 py-4 font-sans text-sm font-light tracking-wide text-sage-dark transition-colors hover:bg-white/60"
              >
                Send e-post
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-warm-light pt-8">
          <Link
            href="/kurs"
            className="font-sans text-sm font-light text-muted transition-colors hover:text-stone"
          >
            ← Tilbake til kurs
          </Link>
        </div>
      </div>
    </article>
  )
}
