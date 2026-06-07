'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { TurnstileWidget } from '@/components/TurnstileWidget'
import type { CourseSessionAvailability } from '@/lib/course-registration'

type FormState = 'idle' | 'submitting' | 'waitlist' | 'error'

const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim())

const inputClassName =
  'w-full rounded-xl border-0 bg-cream/60 px-4 py-3 font-sans text-sm font-normal text-stone ring-1 ring-stone/10 transition-shadow placeholder:text-muted/60 focus:bg-white focus:ring-2 focus:ring-sage/25 focus:outline-none'

type CourseRegistrationFormProps = {
  courseSlug: string
  courseTitle: string
  price: number
  sessions: CourseSessionAvailability[]
  registrationEnabled: boolean
  layout?: 'sidebar' | 'full'
}

export function CourseRegistrationForm({
  courseSlug,
  courseTitle,
  price,
  sessions,
  registrationEnabled,
  layout = 'sidebar',
}: CourseRegistrationFormProps) {
  const isFullWidth = layout === 'full'
  const [selectedSessionKey, setSelectedSessionKey] = useState<string | null>(
    sessions.find((session) => !session.isFull)?.sessionKey ?? sessions[0]?.sessionKey ?? null
  )
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const selectedSession = sessions.find((session) => session.sessionKey === selectedSessionKey)
  const captchaRequired = turnstileEnabled
  const captchaReady = !captchaRequired || Boolean(turnstileToken)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSessionKey) {
      setErrorMessage('Velg en kursdato.')
      return
    }

    if (captchaRequired && !turnstileToken) {
      setErrorMessage('Bekreft at du ikke er en robot.')
      return
    }

    setFormState('submitting')
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const website = typeof formData.get('website') === 'string' ? formData.get('website') : ''

    try {
      const response = await fetch(`/api/courses/${courseSlug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: selectedSessionKey,
          name,
          lastName,
          email,
          phone,
          message,
          website,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      })

      const data = (await response.json()) as {
        checkoutUrl?: string
        status?: string
        waitlistPosition?: number
        message?: string
        error?: string
      }

      if (!response.ok) {
        setTurnstileToken(null)
        throw new Error(data.error ?? 'Kunne ikke fullføre påmeldingen.')
      }

      if (data.status === 'waitlist') {
        setWaitlistPosition(data.waitlistPosition ?? null)
        setFormState('waitlist')
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      throw new Error('Kunne ikke starte betaling.')
    } catch (error) {
      setFormState('error')
      setTurnstileToken(null)
      setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke fullføre påmeldingen.')
    }
  }

  if (!registrationEnabled || sessions.length === 0) {
    return null
  }

  if (formState === 'waitlist') {
    return (
      <div className="rounded-2xl border border-sage/20 bg-sage-light/30 p-6 md:p-8">
        <div className="mb-3 flex items-center gap-3 text-sage-dark">
          <CheckCircle2 className="size-6 shrink-0" aria-hidden />
          <p className="font-serif text-xl font-normal text-stone md:text-2xl">Du står på ventelisten</p>
        </div>
        <p className="text-body-sm md:text-base">
          {waitlistPosition
            ? `Du er nr. ${waitlistPosition} på ventelisten for ${courseTitle}. Vi sender Vipps-lenke på e-post hvis en plass blir ledig.`
            : `Vi har registrert deg på ventelisten for ${courseTitle}.`}
        </p>
      </div>
    )
  }

  const sessionGridClass = isFullWidth
    ? 'grid gap-3 sm:grid-cols-2'
    : 'space-y-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
      <fieldset>
        <legend className="mb-4 font-sans text-sm font-normal text-stone">
          Velg kursdato
        </legend>
        <ul className={sessionGridClass}>
          {sessions.map((session) => {
            const isSelected = selectedSessionKey === session.sessionKey
            const spotsLabel = session.isFull
              ? 'Venteliste'
              : session.spotsLeft <= 3
                ? `${session.spotsLeft} plass${session.spotsLeft === 1 ? '' : 'er'} igjen`
                : `${session.spotsLeft} plasser`

            return (
              <li key={session.sessionKey}>
                <button
                  type="button"
                  onClick={() => setSelectedSessionKey(session.sessionKey)}
                  className={`group relative flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all md:p-5 ${
                    isSelected
                      ? 'bg-sage-light/50 ring-2 ring-sage shadow-sm'
                      : 'bg-cream/30 ring-1 ring-stone/10 hover:bg-cream/50 hover:ring-stone/20'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-cream'
                        : 'border-stone/25 bg-white group-hover:border-sage/40'
                    }`}
                  >
                    {isSelected && <Check className="size-3" strokeWidth={3} aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sans text-sm font-normal leading-snug text-stone md:text-base">
                      {session.label}
                    </span>
                    <span
                      className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 font-sans text-xs font-normal ${
                        session.isFull
                          ? 'bg-stone/10 text-stone/80'
                          : session.spotsLeft <= 3
                            ? 'bg-amber-100/80 text-amber-900'
                            : 'bg-white/80 text-stone/80'
                      }`}
                    >
                      {spotsLabel}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-sans text-sm font-normal text-stone">
          Dine opplysninger
        </legend>
        <div
          className={`grid gap-4 ${isFullWidth ? 'sm:grid-cols-2' : 'gap-3 sm:grid-cols-2'}`}
        >
          <label className="block">
            <span className="mb-2 block text-caption">Fornavn</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              autoComplete="given-name"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-caption">Etternavn</span>
            <input
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClassName}
              autoComplete="family-name"
            />
          </label>
          <label className={`block ${isFullWidth ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
            <span className="mb-2 block text-caption">E-post</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              autoComplete="email"
            />
          </label>
          <label className={`block ${isFullWidth ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
            <span className="mb-2 block text-caption">Telefon</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              autoComplete="tel"
            />
          </label>
          <label className={`block ${isFullWidth ? 'sm:col-span-2' : 'sm:col-span-2'}`}>
            <span className="mb-2 block text-caption">
              Melding <span className="text-muted/60">(valgfritt)</span>
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={isFullWidth ? 3 : 2}
              className={`${inputClassName} resize-none`}
            />
          </label>
        </div>
      </fieldset>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {captchaRequired && (
        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => {
            setTurnstileToken(null)
            setErrorMessage('Sikkerhetskontrollen kunne ikke lastes. Prøv igjen.')
          }}
        />
      )}

      {errorMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-normal text-red-700">
          {errorMessage}
        </p>
      )}

      <div
        className={`border-t border-warm-light pt-6 md:pt-8 ${
          isFullWidth
            ? 'flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'
            : 'space-y-3'
        }`}
      >
        {isFullWidth && (
          <div>
            <p className="text-body-sm">Totalt å betale</p>
            <p className="mt-1 text-heading-section md:text-3xl">
              {price.toLocaleString('nb-NO')} kr
            </p>
          </div>
        )}

        <div className={isFullWidth ? 'w-full sm:max-w-sm' : ''}>
          <p className="mb-3 text-caption leading-relaxed">
            Ved å betale godtar du{' '}
            <Link href="/salgsvilkar" className="text-sage-dark underline underline-offset-2">
              salgsvilkårene
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={formState === 'submitting' || !selectedSession || !captchaReady}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5b24] px-6 py-4 font-sans text-sm font-medium tracking-wide text-white shadow-sm transition-all hover:bg-[#e55220] hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formState === 'submitting' ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sender til Vipps …
              </>
            ) : selectedSession?.isFull ? (
              'Meld deg på venteliste'
            ) : (
              `Betal med Vipps`
            )}
          </button>
          <p className="mt-3 flex flex-col items-center gap-2 text-center text-caption sm:flex-row sm:justify-center">
            <span>Du blir sendt til Vipps for å fullføre betalingen.</span>
            {isFullWidth && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5b24]/10 px-2.5 py-0.5 font-medium text-[#ff5b24]">
                <ShieldCheck className="size-3" aria-hidden />
                Sikker betaling
              </span>
            )}
          </p>
        </div>
      </div>
    </form>
  )
}
