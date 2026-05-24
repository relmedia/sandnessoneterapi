'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatDateNb } from '@/lib/utils'

type Step = 'form' | 'confirm' | 'success' | 'error'

interface BookingPreview {
  service?: string
  date?: string
  time?: string
  status?: string
  canCancel?: boolean
}

export function CancelBookingForm() {
  const searchParams = useSearchParams()
  const initialToken = searchParams.get('token') ?? ''

  const [step, setStep] = useState<Step>(initialToken ? 'confirm' : 'form')
  const [token, setToken] = useState(initialToken)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [booking, setBooking] = useState<BookingPreview | null>(null)
  const [loading, setLoading] = useState(Boolean(initialToken))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [useLookup, setUseLookup] = useState(false)

  useEffect(() => {
    if (!initialToken) return
    void loadBookingByToken(initialToken)
  }, [initialToken])

  async function loadBookingByToken(cancelToken: string) {
    setLoading(true)
    setErrorMessage(null)
    setUseLookup(false)

    try {
      const response = await fetch(`/api/booking/cancel?token=${encodeURIComponent(cancelToken)}`)
      const data = (await response.json()) as { booking?: BookingPreview; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Fant ikke timen.')
      }

      setBooking(data.booking ?? null)
      setToken(cancelToken)
      setStep('confirm')
    } catch (error) {
      setStep('error')
      setErrorMessage(error instanceof Error ? error.message : 'Fant ikke timen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLookupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setUseLookup(true)

    try {
      const response = await fetch('/api/booking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, date, website: '' }),
      })

      const data = (await response.json()) as { booking?: BookingPreview; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Fant ingen time.')
      }

      setBooking(data.booking ?? null)
      setStep('confirm')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Fant ingen time.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel() {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const body =
        !useLookup && token.trim()
          ? { token: token.trim(), website: '' }
          : { email, phone, date, website: '' }

      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = (await response.json()) as { message?: string; error?: string; booking?: BookingPreview }

      if (!response.ok) {
        throw new Error(data.error ?? 'Kunne ikke avbestille.')
      }

      setBooking(data.booking ?? null)
      setStep('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke avbestille.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="font-sans font-light text-muted">Henter time …</p>
  }

  if (step === 'success') {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage-light/40 p-10 text-center max-w-xl">
        <p className="font-serif text-3xl text-stone mb-4">Timen er avbestilt</p>
        <p className="font-sans font-light text-muted leading-relaxed mb-6">
          Avbestillingen er registrert. Ta kontakt om du ønsker en ny time.
        </p>
        <Link
          href="/bestill-time"
          className="inline-block px-8 py-4 bg-sage text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide"
        >
          Bestill ny time
        </Link>
      </div>
    )
  }

  if (step === 'confirm' && booking) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="rounded-2xl border border-warm-light bg-cream p-8">
          <h2 className="font-serif text-2xl text-stone mb-4">Bekreft avbestilling</h2>
          <dl className="space-y-3 font-sans font-light text-muted">
            {booking.service && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-sage">Behandling</dt>
                <dd className="text-stone">{booking.service}</dd>
              </div>
            )}
            {booking.date && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-sage">Dato</dt>
                <dd className="text-stone">
                  {formatDateNb(booking.date, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            )}
            {booking.time && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-sage">Klokkeslett</dt>
                <dd className="text-stone">{booking.time}</dd>
              </div>
            )}
          </dl>
        </div>

        {!booking.canCancel && booking.status === 'cancelled' ? (
          <p className="text-sm font-sans text-muted">Denne timen er allerede avbestilt.</p>
        ) : !booking.canCancel ? (
          <p className="text-sm font-sans text-muted">Timen kan ikke avbestilles online. Ring oss for hjelp.</p>
        ) : (
          <button
            type="button"
            onClick={() => void handleCancel()}
            disabled={submitting}
            className="px-8 py-4 bg-stone text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide disabled:opacity-50"
          >
            {submitting ? 'Avbestiller …' : 'Avbestill timen'}
          </button>
        )}

        {errorMessage && (
          <p className="text-sm font-sans text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setStep('form')
            setBooking(null)
            setErrorMessage(null)
          }}
          className="text-sm font-sans font-light text-sage-dark underline underline-offset-2"
        >
          Tilbake
        </button>
      </div>
    )
  }

  if (step === 'error' && initialToken) {
    return (
      <div className="max-w-xl space-y-6">
        <p className="font-sans font-light text-muted">{errorMessage ?? 'Fant ikke timen.'}</p>
        <button
          type="button"
          onClick={() => {
            setStep('form')
            setErrorMessage(null)
            setToken('')
          }}
          className="text-sm font-sans font-light text-sage-dark underline underline-offset-2"
        >
          Prøv på en annen måte
        </button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-4xl">
      <section>
        <h2 className="font-serif text-2xl text-stone mb-4">Har du avbestillingskode?</h2>
        <p className="font-sans font-light text-muted mb-6 text-sm leading-relaxed">
          Koden vises etter du har bestilt time. Lim den inn her, eller bruk lenken fra bekreftelsen.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void loadBookingByToken(token.trim())
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="block text-sm font-sans font-light text-muted mb-2">Avbestillingskode</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
              placeholder="f.eks. a1b2c3d4-..."
            />
          </label>
          <button
            type="submit"
            disabled={!token.trim() || submitting}
            className="px-6 py-3 bg-sage text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors disabled:opacity-50"
          >
            Finn time
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-stone mb-4">Eller bruk e-post og dato</h2>
        <p className="font-sans font-light text-muted mb-6 text-sm leading-relaxed">
          Oppgi samme e-post, telefon og dato som ved bestilling.
        </p>
        <form onSubmit={handleLookupSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-sans font-light text-muted mb-2">E-post</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-sans font-light text-muted mb-2">Telefon</span>
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-sans font-light text-muted mb-2">Dato for timen</span>
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
            />
          </label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 border border-stone/30 text-stone font-sans font-light text-sm rounded-full hover:border-sage hover:text-sage-dark transition-colors disabled:opacity-50"
          >
            {submitting ? 'Søker …' : 'Finn time'}
          </button>
        </form>
      </section>

      {errorMessage && step === 'form' && (
        <p className="lg:col-span-2 text-sm font-sans text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
