import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, GraduationCap, MapPin } from 'lucide-react'
import { getCourses, getSiteSettings, urlFor } from '@/lib/sanity'
import { getGoogleMapsUrl, getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Kurs',
  description: 'Kommende kurs i soneterapi med Terje Horpestad.',
}

export default async function KursPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSiteSettings()])
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <div className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto">
        <p className="mb-4 font-sans text-xs font-light uppercase tracking-[0.3em] text-sage">
          Utdanning
        </p>
        <h1 className="mb-4 font-serif text-display text-stone">Kurs</h1>
        <p className="mb-16 max-w-xl font-sans text-xl font-light text-muted">
          Terje Horpestad har utdannet soneterapeuter i over 20 år. Her finner du kommende kurs.
        </p>

        {courses.length > 0 ? (
          <div className="flex flex-col gap-6">
            {courses.map((course) => {
              const courseHref = `/kurs/${course.slug.current}`

              return (
                <article
                  key={course._id}
                  className="flex overflow-hidden rounded-2xl border border-warm-light bg-cream transition-colors hover:border-sage/30"
                >
                  <Link
                    href={courseHref}
                    className="relative block w-36 shrink-0 self-stretch bg-sage-light sm:w-52 md:w-64 lg:w-72"
                  >
                    {course.coverImage ? (
                      <Image
                        src={urlFor(course.coverImage).width(640).url()}
                        alt={course.coverImage.alt ?? course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 144px, (max-width: 768px) 208px, 288px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sage-light via-cream to-warm-light/60">
                        <GraduationCap
                          className="h-10 w-10 text-sage/50 sm:h-12 sm:w-12"
                          strokeWidth={1.25}
                          aria-hidden
                        />
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-5 sm:p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <h2 className="font-serif text-xl text-stone sm:text-2xl md:text-3xl">
                          <Link href={courseHref} className="transition-colors hover:text-sage-dark">
                            {course.title}
                          </Link>
                        </h2>
                      </div>
                      {course.price != null && (
                        <span className="shrink-0 rounded-full border border-sage/30 px-3 py-1 font-sans text-xs font-light text-sage-dark sm:text-sm">
                          {course.price.toLocaleString('nb-NO')} kr
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs font-light text-muted sm:text-sm">
                      {course.location && (
                        <a
                          href={getGoogleMapsUrl(course.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-stone"
                        >
                          <MapPin className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                          {course.location}
                        </a>
                      )}
                    </div>

                    {course.shortDescription && (
                      <p className="line-clamp-3 font-sans text-sm font-light leading-relaxed text-muted sm:text-base">
                        {course.shortDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 border-t border-warm-light pt-4 sm:gap-4">
                      <Link
                        href={courseHref}
                        className="inline-flex items-center gap-2 font-sans text-sm font-light text-sage-dark transition-colors hover:text-stone"
                      >
                        Les mer
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                      <a
                        href={`tel:${phoneTel}`}
                        className="inline-block rounded-full bg-sage px-4 py-2 font-sans text-xs font-light tracking-wide text-cream transition-colors hover:bg-sage-dark sm:px-6 sm:py-2.5 sm:text-sm"
                      >
                        Kontakt – {phoneDisplay}
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="font-sans text-lg font-light text-muted">
            Ingen planlagte kurs for øyeblikket. Ring for mer informasjon: {phoneDisplay}.
          </p>
        )}
      </div>
    </div>
  )
}
