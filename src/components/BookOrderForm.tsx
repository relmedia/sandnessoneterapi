'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { TurnstileWidget } from '@/components/TurnstileWidget'
import { DEFAULT_BOOK_SHIPPING_FEE_NOK } from '@/lib/book-order'

type FormState = 'idle' | 'submitting' | 'error'

const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim())

const inputClassName =
  'w-full rounded-xl border-0 bg-cream/60 px-4 py-3 font-sans text-sm font-light text-stone ring-1 ring-stone/10 transition-shadow placeholder:text-muted/60 focus:bg-white focus:ring-2 focus:ring-sage/25 focus:outline-none'

type BookOrderFormProps = {
  bookRef: string
  bookTitle: string
  bookPrice: number
  shippingFee?: number
}

export function BookOrderForm({
  bookRef,
  bookTitle,
  bookPrice,
  shippingFee = DEFAULT_BOOK_SHIPPING_FEE_NOK,
}: BookOrderFormProps) {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const totalPrice = bookPrice + shippingFee
  const captchaRequired = turnstileEnabled
  const captchaReady = !captchaRequired || Boolean(turnstileToken)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (captchaRequired && !turnstileToken) {
      setErrorMessage('Bekreft at du ikke er en robot.')
      return
    }

    setFormState('submitting')
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const website = typeof formData.get('website') === 'string' ? formData.get('website') : ''

    try {
      const response = await fetch(`/api/books/${encodeURIComponent(bookRef)}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lastName,
          email,
          phone,
          addressLine1,
          postalCode,
          city,
          message,
          website,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      })

      const data = (await response.json()) as {
        orderId?: string
        error?: string
      }

      if (!response.ok || !data.orderId) {
        setTurnstileToken(null)
        throw new Error(data.error ?? 'Kunne ikke fullføre bestillingen.')
      }

      window.location.href = `/boker/bestilt?order=${encodeURIComponent(data.orderId)}`
    } catch (error) {
      setFormState('error')
      setTurnstileToken(null)
      setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke fullføre bestillingen.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
      <fieldset>
        <legend className="mb-4 font-sans text-sm font-light text-stone">Dine opplysninger</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-sans text-xs font-light text-muted">Fornavn</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              autoComplete="given-name"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-sans text-xs font-light text-muted">Etternavn</span>
            <input
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClassName}
              autoComplete="family-name"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-2 block font-sans text-xs font-light text-muted">E-post</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              autoComplete="email"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-2 block font-sans text-xs font-light text-muted">Telefon</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              autoComplete="tel"
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-sans text-sm font-light text-stone">Leveringsadresse</legend>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block font-sans text-xs font-light text-muted">Gateadresse</span>
            <input
              required
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              className={inputClassName}
              autoComplete="address-line1"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <label className="block">
              <span className="mb-2 block font-sans text-xs font-light text-muted">Postnummer</span>
              <input
                required
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                className={inputClassName}
                autoComplete="postal-code"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-sans text-xs font-light text-muted">Poststed</span>
              <input
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={inputClassName}
                autoComplete="address-level2"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block font-sans text-xs font-light text-muted">
              Melding <span className="text-muted/60">(valgfritt)</span>
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
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
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-light text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="border-t border-warm-light pt-6 md:pt-8">
        <div className="mb-5 space-y-2 font-sans text-sm font-light text-muted">
          <div className="flex items-center justify-between gap-4">
            <span>{bookTitle}</span>
            <span>{bookPrice.toLocaleString('nb-NO')} kr</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Frakt</span>
            <span>{shippingFee.toLocaleString('nb-NO')} kr</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-warm-light pt-2 text-stone">
            <span>Totalt</span>
            <span className="font-serif text-xl">{totalPrice.toLocaleString('nb-NO')} kr</span>
          </div>
        </div>

        <p className="mb-4 font-sans text-xs font-light leading-relaxed text-muted">
          Ved å sende bestillingen godtar du{' '}
          <Link href="/salgsvilkar" className="text-sage-dark underline underline-offset-2">
            salgsvilkårene
          </Link>
          . Du får betalingsinstruksjoner for Vipps på neste side.
        </p>

        <button
          type="submit"
          disabled={formState === 'submitting' || !captchaReady}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5b24] px-6 py-4 font-sans text-sm font-medium tracking-wide text-white shadow-sm transition-all hover:bg-[#e55220] hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {formState === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sender bestilling …
            </>
          ) : (
            'Send bestilling'
          )}
        </button>
      </div>
    </form>
  )
}
