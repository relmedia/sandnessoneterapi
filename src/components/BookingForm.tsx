'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock, User } from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { nb } from 'react-day-picker/locale'
import { startOfDay } from 'date-fns'
import { formatDateIso, getDefaultAvailabilityRange, BOOKING_SERVICES } from '@/lib/booking'
import { formatDateNb } from '@/lib/utils'
import 'react-day-picker/style.css'
import './booking-calendar.css'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const inputClassName =
  'w-full rounded-xl border border-stone/10 bg-cream/40 px-4 py-3 font-sans text-sm font-light text-stone transition-colors focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/15'

const panelClassName =
  'rounded-xl border border-stone/10 bg-cream/30 p-3 sm:p-4'

const steps = [
  { id: 1, label: 'Dato', icon: CalendarDays },
  { id: 2, label: 'Tid', icon: Clock },
  { id: 3, label: 'Opplysninger', icon: User },
] as const

export function BookingForm() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cancelToken, setCancelToken] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState<string>(BOOKING_SERVICES[0].value)
  const [message, setMessage] = useState('')
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [availabilityLoading, setAvailabilityLoading] = useState(true)

  const defaultClassNames = getDefaultClassNames()
  const selectedDateIso = selectedDate ? formatDateIso(selectedDate) : null

  const activeStep = !selectedDate ? 1 : !selectedTime ? 2 : 3

  useEffect(() => {
    const { from, to } = getDefaultAvailabilityRange()

    async function loadAvailability() {
      setAvailabilityLoading(true)

      try {
        const response = await fetch(`/api/booking/availability?from=${from}&to=${to}`)
        const data = (await response.json()) as { dates?: string[]; error?: string }

        if (!response.ok) {
          throw new Error(data.error ?? 'Kunne ikke hente ledige dager.')
        }

        setAvailableDates(new Set(data.dates ?? []))
      } catch (error) {
        setAvailableDates(new Set())
        setErrorMessage(
          error instanceof Error ? error.message : 'Kunne ikke hente ledige dager.'
        )
      } finally {
        setAvailabilityLoading(false)
      }
    }

    void loadAvailability()
  }, [])

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
    date < startOfDay(new Date()) || !availableDates.has(formatDateIso(date))

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
          lastName,
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
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-sage/20 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage-light">
          <CheckCircle2 className="h-7 w-7 text-sage-dark" aria-hidden />
        </div>
        <p className="mb-3 font-serif text-3xl text-stone">Takk for bestillingen!</p>
        <p className="mb-8 font-sans text-sm font-light leading-relaxed text-muted">
          Timeforespørselen er mottatt. Du får en bekreftelse på e-post med detaljer og
          avbestillingskode. Terje tar kontakt for å bekrefte dato og tid.
        </p>
        {cancelToken && (
          <div className="mb-8 rounded-xl border border-stone/10 bg-cream/60 p-5 text-left">
            <p className="mb-2 font-sans text-xs uppercase tracking-widest text-sage">Avbestilling</p>
            <p className="mb-4 font-sans text-sm font-light text-muted">
              Lagre denne lenken om du må avbestille senere:
            </p>
            <Link
              href={`/avbestill?token=${encodeURIComponent(cancelToken)}`}
              className="inline-block break-all font-sans text-sm text-sage-dark underline underline-offset-2"
            >
              Avbestill timen
            </Link>
          </div>
        )}
        <Link
          href="/avbestill"
          className="font-sans text-sm font-light text-muted transition-colors hover:text-sage-dark"
        >
          Avbestill uten lenke
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-stone/10 bg-white shadow-sm"
    >
      <div className="grid grid-cols-3 border-b border-stone/10 bg-sage-light/25">
        {steps.map(({ id, label, icon: Icon }) => {
          const isActive = activeStep === id
          const isComplete = activeStep > id

          return (
            <div
              key={id}
              className={`flex flex-col items-center gap-1.5 px-3 py-4 text-center sm:flex-row sm:justify-center sm:gap-2 ${
                isActive ? 'bg-white/70' : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                  isComplete
                    ? 'bg-sage text-cream'
                    : isActive
                      ? 'bg-stone text-cream'
                      : 'bg-stone/10 text-muted'
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : id}
              </span>
              <span
                className={`hidden font-sans text-xs uppercase tracking-wider sm:inline ${
                  isActive ? 'text-stone' : 'text-muted'
                }`}
              >
                {label}
              </span>
              <Icon className="h-4 w-4 text-sage sm:hidden" aria-hidden />
            </div>
          )
        })}
      </div>

      <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12">
        <section>
          <h2 className="mb-1 font-serif text-xl text-stone">Velg dato</h2>
          <p className="mb-5 font-sans text-sm font-light text-muted">
            {availabilityLoading
              ? 'Henter ledige dager …'
              : availableDates.size > 0
                ? 'Kun markerte dager er åpne for timebestilling.'
                : 'Ingen ledige dager er lagt inn ennå. Ring oss for å avtale time.'}
          </p>
          <div className={`booking-calendar w-full ${panelClassName}`}>
            <DayPicker
              mode="single"
              locale={nb}
              weekStartsOn={1}
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDisabledDay}
              classNames={{
                ...defaultClassNames,
                root: `${defaultClassNames.root} mx-auto font-sans`,
                month_caption: `${defaultClassNames.month_caption} mb-3 font-serif text-lg text-stone`,
                weekday: `${defaultClassNames.weekday} text-muted text-[0.65rem] uppercase tracking-wider font-light`,
                day: `${defaultClassNames.day} rounded-full`,
                day_button: `${defaultClassNames.day_button} text-stone hover:bg-sage-light/60 transition-colors`,
                selected: `${defaultClassNames.selected}`,
                today: `${defaultClassNames.today}`,
                disabled: `${defaultClassNames.disabled} opacity-30`,
                button_previous: `${defaultClassNames.button_previous}`,
                button_next: `${defaultClassNames.button_next}`,
                chevron: `${defaultClassNames.chevron}`,
              }}
            />
          </div>
        </section>

        <div className={`space-y-10 ${panelClassName}`}>
          <section>
            <h2 className="mb-1 font-serif text-xl text-stone">Velg klokkeslett</h2>
            {!selectedDate && (
              <p className="font-sans text-sm font-light text-muted">
                Velg en dato i kalenderen for å se ledige tider.
              </p>
            )}
            {selectedDate && slotsLoading && (
              <p className="font-sans text-sm font-light text-muted">Henter ledige tider …</p>
            )}
            {selectedDate && !slotsLoading && slots.length === 0 && (
              <p className="font-sans text-sm font-light text-muted">
                Ingen ledige tider{' '}
                {formatDateNb(selectedDateIso!, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                . Velg en annen dag.
              </p>
            )}
            {selectedDate && !slotsLoading && slots.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-xl border px-3 py-2.5 font-sans text-sm font-light transition-colors ${
                      selectedTime === slot
                        ? 'border-sage bg-sage text-cream'
                        : 'border-stone/10 bg-cream/40 text-stone hover:border-sage/30 hover:bg-sage-light/50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-1 font-serif text-xl text-stone">Dine opplysninger</h2>
            <p className="mb-6 font-sans text-sm font-light text-muted">
              Terje bekrefter timen og tar kontakt med deg.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-sans text-sm font-light text-muted">Fornavn *</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                  autoComplete="given-name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-sans text-sm font-light text-muted">Etternavn *</span>
                <input
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClassName}
                  autoComplete="family-name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-sans text-sm font-light text-muted">Telefon *</span>
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClassName}
                  autoComplete="tel"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-sans text-sm font-light text-muted">E-post *</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                  autoComplete="email"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block font-sans text-sm font-light text-muted">Behandling *</span>
                <select
                  required
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className={inputClassName}
                >
                  {BOOKING_SERVICES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block font-sans text-sm font-light text-muted">
                  Melding (valgfritt)
                </span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  className={`${inputClassName} resize-y`}
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
              <p className="mt-4 font-sans text-sm text-red-700" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={formState === 'submitting' || !selectedDate || !selectedTime}
              className="mt-8 w-full rounded-full bg-stone px-8 py-4 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {formState === 'submitting' ? 'Sender …' : 'Send timeforespørsel'}
            </button>
          </section>
        </div>
      </div>
    </form>
  )
}
