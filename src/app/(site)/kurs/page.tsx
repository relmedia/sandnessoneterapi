import type { Metadata } from 'next'
import { getCourses, getSiteSettings } from '@/lib/sanity'
import { formatDateNb, getPhoneDisplay, getPhoneTel } from '@/lib/utils'

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
        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          Utdanning
        </p>
        <h1 className="font-serif text-display text-stone mb-4">Kurs</h1>
        <p className="font-sans font-light text-xl text-muted mb-16 max-w-xl">
          Terje Horpestad har utdannet soneterapeuter i over 20 år. Her finner du kommende kurs.
        </p>

        {courses.length > 0 ? (
          <div className="flex flex-col gap-8">
            {courses.map((course) => (
              <article
                key={course._id}
                className="p-8 md:p-10 rounded-2xl border border-warm-light bg-cream hover:border-sage/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    {course.startDate && (
                      <p className="font-sans text-xs text-sage uppercase tracking-widest mb-2">
                        {formatDateNb(course.startDate, {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {course.endDate && course.endDate !== course.startDate && (
                          <>
                            {' '}
                            –{' '}
                            {formatDateNb(course.endDate, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </>
                        )}
                      </p>
                    )}
                    <h2 className="font-serif text-2xl md:text-3xl text-stone">{course.title}</h2>
                  </div>
                  {course.price != null && (
                    <span className="font-sans font-light text-sm text-sage-dark border border-sage/30 px-4 py-1 rounded-full whitespace-nowrap">
                      {course.price.toLocaleString('nb-NO')} kr
                    </span>
                  )}
                </div>

                {course.location && (
                  <p className="font-sans font-light text-sm text-muted mb-4">
                    📍 {course.location}
                  </p>
                )}

                {course.shortDescription && (
                  <p className="font-sans font-light text-muted leading-relaxed mb-4">
                    {course.shortDescription}
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-warm-light">
                  <a
                    href={`tel:${phoneTel}`}
                    className="inline-block px-6 py-3 bg-sage text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide"
                  >
                    Kontakt for påmelding – {phoneDisplay} →
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="font-sans font-light text-muted text-lg">
            Ingen planlagte kurs for øyeblikket. Ring for mer informasjon: {phoneDisplay}.
          </p>
        )}
      </div>
    </div>
  )
}
