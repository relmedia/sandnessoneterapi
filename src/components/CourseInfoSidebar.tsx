import { CalendarDays, Mail, MapPin, Phone } from 'lucide-react'
import { CourseRegistrationForm } from '@/components/CourseRegistrationForm'
import type { CourseSessionAvailability } from '@/lib/course-registration'
import { formatCourseSession } from '@/lib/utils'
import type { CourseSession } from '@/lib/types'

type CourseInfoSidebarProps = {
  courseSlug: string
  title: string
  location?: string
  price?: number
  sessions: CourseSession[]
  sessionAvailability: CourseSessionAvailability[]
  registrationEnabled: boolean
  showOnlineRegistration?: boolean
  phoneDisplay: string
  phoneTel: string
  email?: string
  mapsUrl?: string
  layout?: 'sidebar' | 'full'
  className?: string
}

export function CourseInfoSidebar({
  courseSlug,
  title,
  location,
  price,
  sessions,
  sessionAvailability,
  registrationEnabled,
  showOnlineRegistration: showOnlineRegistrationProp,
  phoneDisplay,
  phoneTel,
  email,
  mapsUrl,
  layout = 'sidebar',
  className,
}: CourseInfoSidebarProps) {
  const isFullWidth = layout === 'full'
  const showOnlineRegistration =
    showOnlineRegistrationProp ??
    (registrationEnabled &&
      typeof price === 'number' &&
      price > 0 &&
      sessionAvailability.length > 0)

  if (isFullWidth && showOnlineRegistration) {
    return (
      <div className={className}>
        <div className="mb-8 md:mb-10">
          <p className="mb-3 font-sans text-xs font-light uppercase tracking-[0.3em] text-sage">
            Påmelding
          </p>
          <h2 className="font-serif text-3xl text-stone md:text-4xl">Meld deg på kurset</h2>
          <p className="mt-3 max-w-2xl font-sans text-base font-light leading-relaxed text-muted">
            Velg kursdato, fyll inn opplysningene dine og fullfør betalingen med Vipps.
          </p>
          {location && mapsUrl && (
            <p className="mt-4 font-sans text-sm font-light text-muted">
              <MapPin className="mr-1.5 inline size-4 -translate-y-px text-sage-dark" aria-hidden />
              Kurset holdes på{' '}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone underline-offset-2 transition-colors hover:text-sage-dark hover:underline"
              >
                {location}
              </a>
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone/10 bg-white shadow-sm ring-1 ring-stone/5">
          <div className="px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
            <CourseRegistrationForm
              courseSlug={courseSlug}
              courseTitle={title}
              price={price!}
              sessions={sessionAvailability}
              registrationEnabled={registrationEnabled}
              layout="full"
            />
          </div>
          <div className="border-t border-warm-light bg-cream/40 px-6 py-4 text-center md:px-10">
            <p className="font-sans text-xs font-light text-muted">
              Spørsmål om påmelding?{' '}
              <a
                href={`tel:${phoneTel}`}
                className="text-stone underline-offset-2 transition-colors hover:text-sage-dark hover:underline"
              >
                Ring {phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isFullWidth && !showOnlineRegistration) {
    return (
      <div className={className}>
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-stone">Påmelding</h2>
          <p className="mt-2 font-sans text-base font-light text-muted">
            Ta kontakt for å melde deg på kurset.
          </p>
        </div>
        <div className="rounded-3xl border border-stone/10 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone px-6 py-3.5 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              Ring {phoneDisplay}
            </a>
            {email && (
              <a
                href={`mailto:${email}?subject=${encodeURIComponent(`Påmelding: ${title}`)}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone/20 px-6 py-3.5 font-sans text-sm font-light tracking-wide text-stone transition-colors hover:border-sage hover:text-sage-dark"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                Send e-post
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <aside
      className={`overflow-hidden rounded-2xl border border-stone/10 bg-white shadow-md ring-1 ring-stone/5 ${className ?? ''}`}
    >
      {price != null && (
        <div className="border-b border-stone/10 bg-stone px-6 py-6 text-cream">
          <p className="font-sans text-[11px] font-light uppercase tracking-[0.25em] text-cream/70">
            Kurspris
          </p>
          <p className="mt-1 font-serif text-4xl leading-none">
            {price.toLocaleString('nb-NO')} kr
          </p>
          {showOnlineRegistration && (
            <p className="mt-3 font-sans text-sm font-light text-cream/80">
              Sikker betaling med Vipps
            </p>
          )}
        </div>
      )}

      {(location || (!showOnlineRegistration && sessions.length > 0)) && (
        <div className="space-y-4 border-b border-warm-light bg-cream/20 px-6 py-5">
          {location && mapsUrl && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-light/80 text-sage-dark">
                <MapPin className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-sans text-[11px] font-light uppercase tracking-[0.25em] text-sage">
                  Sted
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-sans text-sm font-light leading-relaxed text-stone transition-colors hover:text-sage-dark"
                >
                  {location}
                </a>
              </div>
            </div>
          )}

          {!showOnlineRegistration && sessions.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-light/80 text-sage-dark">
                <CalendarDays className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[11px] font-light uppercase tracking-[0.25em] text-sage">
                  Datoer
                </p>
                <ul className="mt-2 space-y-2">
                  {sessions.map((session, index) => {
                    const label = formatCourseSession(session)
                    if (!label) return null

                    return (
                      <li
                        key={`${session.date}-${session.startTime ?? index}`}
                        className="rounded-xl border border-stone/10 bg-white px-4 py-2.5 font-sans text-sm font-light text-stone"
                      >
                        {label}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {showOnlineRegistration ? (
        <div className="px-6 py-6">
          <div className="mb-5">
            <h2 className="font-serif text-xl text-stone">Meld deg på</h2>
            <p className="mt-1 font-sans text-sm font-light text-muted">
              Velg dato, fyll inn opplysninger og betal med Vipps.
            </p>
          </div>
          <CourseRegistrationForm
            courseSlug={courseSlug}
            courseTitle={title}
            price={price!}
            sessions={sessionAvailability}
            registrationEnabled={registrationEnabled}
            layout="sidebar"
          />
        </div>
      ) : (
        <div className="space-y-3 px-6 py-6">
          <h2 className="font-serif text-xl text-stone">Påmelding</h2>
          <p className="font-sans text-sm font-light text-muted">
            Ta kontakt for å melde deg på kurset.
          </p>
          <a
            href={`tel:${phoneTel}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stone px-5 py-3.5 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            Ring {phoneDisplay}
          </a>
          {email && (
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(`Påmelding: ${title}`)}`}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-stone/20 px-5 py-3.5 font-sans text-sm font-light tracking-wide text-stone transition-colors hover:border-sage hover:text-sage-dark"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              Send e-post
            </a>
          )}
        </div>
      )}

      {showOnlineRegistration && (
        <div className="border-t border-warm-light bg-cream/30 px-6 py-4 text-center">
          <p className="font-sans text-xs font-light text-muted">
            Spørsmål?{' '}
            <a
              href={`tel:${phoneTel}`}
              className="text-stone underline-offset-2 transition-colors hover:text-sage-dark hover:underline"
            >
              Ring {phoneDisplay}
            </a>
          </p>
        </div>
      )}
    </aside>
  )
}
