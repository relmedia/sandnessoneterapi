'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { nb } from 'react-day-picker/locale'
import { isValid, parseISO } from 'date-fns'
import { formatDateIso } from '@/lib/booking'
import { formatDateNb } from '@/lib/utils'
import 'react-day-picker/style.css'
import '@/components/booking-calendar.css'

type FloatingLabelDateFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
  id?: string
}

function getPickerClassNames() {
  const defaultClassNames = getDefaultClassNames()

  return {
    ...defaultClassNames,
    root: `${defaultClassNames.root} mx-auto font-sans`,
    month_caption: `${defaultClassNames.month_caption} mb-3 font-serif text-lg font-normal text-stone`,
    weekday: `${defaultClassNames.weekday} text-stone/80 text-[0.7rem] uppercase tracking-wider font-normal`,
    day: `${defaultClassNames.day} rounded-full`,
    day_button: `${defaultClassNames.day_button} text-stone hover:bg-sage-light/60 transition-colors`,
    selected: `${defaultClassNames.selected}`,
    today: `${defaultClassNames.today}`,
    disabled: `${defaultClassNames.disabled} opacity-30`,
    button_previous: `${defaultClassNames.button_previous}`,
    button_next: `${defaultClassNames.button_next}`,
    chevron: `${defaultClassNames.chevron}`,
  }
}

export function FloatingLabelDateField({
  label,
  value,
  onChange,
  required,
  className,
  id: idProp,
}: FloatingLabelDateFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const labelId = `${id}-label`
  const popoverId = `${id}-popover`
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  const selectedDate =
    value && isValid(parseISO(value)) ? parseISO(value) : undefined
  const floated = focused || open || Boolean(value)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setFocused(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className={className} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          required={required}
          readOnly
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute h-px w-px opacity-0"
          onChange={() => {}}
        />
        <button
          type="button"
          id={id}
          aria-labelledby={labelId}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          onClick={() => {
            setOpen((prev) => !prev)
            setFocused(true)
          }}
          className={`flex w-full items-center rounded-xl border bg-cream px-4 pb-2.5 pt-6 text-left font-sans text-base font-normal transition-colors focus:border-sage focus:outline-none ${
            open ? 'border-sage' : 'border-warm-light'
          }`}
        >
          <span className={value ? 'text-stone' : 'text-transparent select-none'}>
            {selectedDate
              ? formatDateNb(selectedDate, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Velg dato'}
          </span>
          <CalendarDays className="ml-auto size-4 shrink-0 text-sage-dark" aria-hidden />
        </button>
        <label
          id={labelId}
          htmlFor={id}
          className={`pointer-events-none absolute left-4 origin-left transition-all duration-200 ease-out ${
            floated
              ? 'top-2.5 translate-y-0 text-xs font-normal text-sage'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal text-stone/70'
          }`}
        >
          {label}
        </label>

        {open && (
          <div
            id={popoverId}
            role="dialog"
            aria-label={label}
            className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-warm-light bg-cream p-3 shadow-lg"
          >
            <div className="booking-calendar w-full">
              <DayPicker
                mode="single"
                locale={nb}
                weekStartsOn={1}
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return
                  onChange(formatDateIso(date))
                  setOpen(false)
                  setFocused(true)
                }}
                classNames={getPickerClassNames()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
