'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { nb } from 'react-day-picker/locale'
import { startOfDay } from 'date-fns'
import { formatDateIso, isBookableDate, BOOKING_SERVICES } from '@/lib/booking'
import { formatDateNb } from '@/lib/utils'
import 'react-day-picker/style.css'

interface BookingFormProps {
  defaultPhone?: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function BookingForm({ defaultPhone }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cancelToken, setCancelToken] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(defaultPhone ?? '')
  const [service, setService] = useState<string>(BOOKING_SERVICES[0].value)
  const [message, setMessage] = useState('')

  const defaultClassNames = getDefaultClassNames()

  const selectedDateIso = selectedDate ? formatDateIso(selectedDate) : null

  async function loadSlots(dateIso: string) {
    setSlotsLoading(true)
    setSelectedTime(null)
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/booking?date=${dateIso}`)
      const data = (await response.json()) as { slots?: string[]; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Kunne ikke hente ledige tider.')
      }

      setSlots(data.slots ?? [])
    } catch (error) {
      setSlots([])
      setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke hente ledige tider.')
    } finally {
      setSlotsLoading(false)
    }
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)

    if (!date) {
      setSlots([])
      setSelectedTime(null)
      return
    }

    void loadSlots(formatDateIso(date))
  }

  const isDisabledDay = (date: Date) =>
    date < startOfDay(new Date()) ||
    date.getDay() === 0 ||
    date.getDay() === 6 ||
    !isBookableDate(date)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedDateIso || !selectedTime) {
      setErrorMessage('Velg dato og klokkeslett.')
      setFormState('error')
      return
    }

    setFormState('submitting')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          service,
          date: selectedDateIso,
          time: selectedTime,
          message,
          website: '',
        }),
      })

      const data = (await response.json()) as { message?: string; error?: string; cancelToken?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Noe gikk galt. Prøv igjen.')
      }

      setCancelToken(data.cancelToken ?? null)
      setFormState('success')
      setErrorMessage(null)
    } catch (error) {
      setFormState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Noe gikk galt. Prøv igjen.')
    }
  }

  if (formState === 'success') {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage-light/40 p-10 text-center max-w-lg mx-auto">
        <p className="font-serif text-3xl text-stone mb-4">Takk for bestillingen!</p>
        <p className="font-sans font-light text-muted leading-relaxed mb-6">
          Timeforespørselen er mottatt. Terje tar kontakt for å bekrefte dato og tid.
        </p>
        {cancelToken && (
          <div className="rounded-xl border border-warm-light bg-cream/80 p-5 text-left mb-6">
            <p className="text-xs font-sans uppercase tracking-widest text-sage mb-2">Avbestilling</p>
            <p className="font-sans font-light text-sm text-muted mb-4">
              Lagre denne lenken om du må avbestille senere:
            </p>
            <Link
              href={`/avbestill?token=${encodeURIComponent(cancelToken)}`}
              className="inline-block text-sm font-sans text-sage-dark underline underline-offset-2 break-all"
            >
              Avbestill timen
            </Link>
          </div>
        )}
        <Link
          href="/avbestill"
          className="text-sm font-sans font-light text-muted hover:text-sage-dark transition-colors"
        >
          Avbestill uten lenke
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[320px_1fr] gap-12">
      <div>
        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          Steg 1
        </p>
        <h2 className="font-serif text-2xl text-stone mb-6">Velg dato</h2>
        <div className="rounded-2xl border border-warm-light bg-cream p-4 booking-calendar">
          <DayPicker
            mode="single"
            locale={nb}
            weekStartsOn={1}
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDisabledDay}
            classNames={{
              ...defaultClassNames,
              root: `${defaultClassNames.root} font-sans`,
              month_caption: `${defaultClassNames.month_caption} font-serif text-lg text-stone`,
              weekday: `${defaultClassNames.weekday} text-muted text-xs uppercase tracking-wider font-light`,
              day: `${defaultClassNames.day} rounded-full`,
              day_button: `${defaultClassNames.day_button} hover:bg-sage-light transition-colors`,
              selected: `${defaultClassNames.selected} !bg-sage !text-cream`,
              today: `${defaultClassNames.today} text-sage-dark font-medium`,
              disabled: `${defaultClassNames.disabled} opacity-30`,
            }}
          />
        </div>
        <p className="mt-4 text-xs font-sans font-light text-muted">
          Timebestilling mandag–fredag. Terje bekrefter timen manuelt.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
            Steg 2
          </p>
          <h2 className="font-serif text-2xl text-stone mb-4">Velg klokkeslett</h2>
          {!selectedDate && (
            <p className="font-sans font-light text-muted">Velg en dato i kalenderen først.</p>
          )}
          {selectedDate && slotsLoading && (
            <p className="font-sans font-light text-muted">Henter ledige tider …</p>
          )}
          {selectedDate && !slotsLoading && slots.length === 0 && (
            <p className="font-sans font-light text-muted">
              Ingen ledige tider {formatDateNb(selectedDateIso!, { weekday: 'long', day: 'numeric', month: 'long' })}.
              Velg en annen dag.
            </p>
          )}
          {selectedDate && !slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`px-4 py-3 rounded-full text-sm font-sans font-light border transition-colors ${
                    selectedTime === slot
                      ? 'bg-sage text-cream border-sage'
                      : 'border-warm-light text-stone hover:border-sage/40 hover:bg-sage-light/40'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
            Steg 3
          </p>
          <h2 className="font-serif text-2xl text-stone mb-6">Dine opplysninger</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="block text-sm font-sans font-light text-muted mb-2">Navn *</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-sans font-light text-muted mb-2">Telefon *</span>
              <input
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
                autoComplete="tel"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="block text-sm font-sans font-light text-muted mb-2">E-post *</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
                autoComplete="email"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="block text-sm font-sans font-light text-muted mb-2">Behandling *</span>
              <select
                required
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage"
              >
                {BOOKING_SERVICES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="block text-sm font-sans font-light text-muted mb-2">
                Melding (valgfritt)
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-warm-light bg-cream font-sans font-light text-stone focus:outline-none focus:border-sage resize-y"
                placeholder="Fortell gjerne kort hva du ønsker hjelp med …"
              />
            </label>
          </div>

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          {errorMessage && (
            <p className="mt-4 text-sm font-sans text-red-700" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={formState === 'submitting' || !selectedDate || !selectedTime}
            className="mt-8 px-8 py-4 bg-stone text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState === 'submitting' ? 'Sender …' : 'Send timeforespørsel'}
          </button>
        </section>
      </div>
    </form>
  )
}
