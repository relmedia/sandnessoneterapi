'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Step = 'form' | 'confirm' | 'success' | 'error'

interface RegistrationPreview {
  courseTitle?: string
  sessionDate?: string
  status?: string
  canCancel?: boolean
}

export default function CourseCancelPage() {
  const searchParams = useSearchParams()
  const initialToken = searchParams.get('token') ?? ''

  const [step, setStep] = useState<Step>(initialToken ? 'confirm' : 'form')
  const [token, setToken] = useState(initialToken)
  const [registration, setRegistration] = useState<RegistrationPreview | null>(null)
  const [loading, setLoading] = useState(Boolean(initialToken))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!initialToken) return
    void loadRegistration(initialToken)
  }, [initialToken])

  async function loadRegistration(cancelToken: string) {
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `/api/course-registration/cancel?token=${encodeURIComponent(cancelToken)}`
      )
      const data = (await response.json()) as {
        registration?: RegistrationPreview
        error?: string
      }

      if (!response.ok) {
        throw new Error(data.error ?? 'Fant ikke påmeldingen.')
      }

      setRegistration(data.registration ?? null)
      setToken(cancelToken)
      setStep('confirm')
    } catch (error) {
      setStep('error')
      setErrorMessage(error instanceof Error ? error.message : 'Fant ikke påmeldingen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/course-registration/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Kunne ikke avbestille.')
      }

      setStep('success')
    } catch (error) {
      setStep('error')
      setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke avbestille.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="mb-6 font-serif text-3xl text-stone">Avbestill kurs</h1>

      {step === 'form' && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void loadRegistration(token)
          }}
          className="space-y-4 rounded-2xl border border-stone/10 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="mb-2 block font-sans text-sm font-light text-muted">
              Avbestillingskode fra e-post
            </span>
            <input
              required
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full rounded-xl border border-stone/10 bg-cream/40 px-4 py-3 font-sans text-sm font-light text-stone"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-stone px-6 py-3 font-sans text-sm font-light tracking-wide text-cream"
          >
            {loading ? 'Søker …' : 'Finn påmelding'}
          </button>
        </form>
      )}

      {step === 'confirm' && registration && (
        <div className="space-y-4 rounded-2xl border border-stone/10 bg-white p-6 shadow-sm">
          <p className="font-sans text-sm font-light text-muted">
            {registration.courseTitle}
            {registration.sessionDate ? ` · ${registration.sessionDate}` : ''}
          </p>
          <button
            type="button"
            onClick={() => void handleCancel()}
            disabled={submitting || !registration.canCancel}
            className="rounded-full bg-stone px-6 py-3 font-sans text-sm font-light tracking-wide text-cream disabled:opacity-60"
          >
            {submitting ? 'Avbestiller …' : 'Bekreft avbestilling'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="rounded-2xl border border-sage/20 bg-sage-light/40 p-6">
          <p className="font-sans text-base font-light text-stone">
            Påmeldingen er avbestilt. Bekreftet betaling refunderes automatisk.
          </p>
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-light text-red-700">
          {errorMessage}
        </p>
      )}
    </>
  )
}
