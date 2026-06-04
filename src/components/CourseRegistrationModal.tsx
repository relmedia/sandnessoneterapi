'use client'

import { useEffect, useId, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { CourseRegistrationForm } from '@/components/CourseRegistrationForm'
import type { CourseSessionAvailability } from '@/lib/course-registration'

type CourseRegistrationModalProps = {
  open: boolean
  onClose: () => void
  courseSlug: string
  courseTitle: string
  price: number
  sessions: CourseSessionAvailability[]
  registrationEnabled: boolean
  phoneDisplay: string
  phoneTel: string
  location?: string
  mapsUrl?: string
}

export function CourseRegistrationModal({
  open,
  onClose,
  courseSlug,
  courseTitle,
  price,
  sessions,
  registrationEnabled,
  phoneDisplay,
  phoneTel,
  location,
  mapsUrl,
}: CourseRegistrationModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="absolute inset-0 bg-stone/50 backdrop-blur-[2px]"
        aria-label="Lukk påmelding"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-white sm:mx-auto sm:my-auto sm:h-auto sm:max-h-[min(90vh,900px)] sm:max-w-2xl sm:rounded-2xl sm:shadow-xl sm:ring-1 sm:ring-stone/10"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-warm-light px-5 py-4 sm:px-8 sm:py-6">
          <div className="min-w-0 pr-2">
            <p className="mb-1 font-sans text-xs font-light uppercase tracking-[0.3em] text-sage">
              Påmelding
            </p>
            <h2 id={titleId} className="font-serif text-2xl text-stone sm:text-3xl">
              Meld deg på kurset
            </h2>
            <p id={descriptionId} className="mt-2 font-sans text-sm font-light text-muted">
              Velg kursdato, fyll inn opplysningene dine og fullfør betalingen med Vipps.
            </p>
            {location && mapsUrl && (
              <p className="mt-3 font-sans text-sm font-light text-muted">
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
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream hover:text-stone"
            aria-label="Lukk"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <CourseRegistrationForm
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            price={price}
            sessions={sessions}
            registrationEnabled={registrationEnabled}
            layout="full"
          />
        </div>

        <div className="shrink-0 border-t border-warm-light bg-cream/40 px-5 py-4 text-center sm:px-8">
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

type CourseRegistrationTriggerProps = Omit<CourseRegistrationModalProps, 'open' | 'onClose'> & {
  className?: string
}

export function CourseRegistrationTrigger({
  className,
  ...modalProps
}: CourseRegistrationTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'cursor-pointer rounded-full bg-stone px-8 py-4 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark'
        }
      >
        Meld deg på
      </button>
      <CourseRegistrationModal {...modalProps} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
