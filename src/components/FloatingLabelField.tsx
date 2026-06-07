'use client'

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const defaultFieldClassName =
  'w-full rounded-xl border border-warm-light bg-cream px-4 pb-2.5 pt-6 font-sans text-base font-normal text-stone transition-colors focus:border-sage focus:outline-none'

function useFloatingLabel(
  value: string | number | readonly string[] | undefined,
  defaultValue: string | number | readonly string[] | undefined,
) {
  const [focused, setFocused] = useState(false)

  const hasValue =
    value !== undefined && value !== ''
      ? true
      : defaultValue !== undefined && defaultValue !== ''

  return {
    focused,
    setFocused,
    floated: focused || hasValue,
  }
}

function FloatingLabel({
  id,
  label,
  floated,
  alignTop = false,
  children,
}: {
  id: string
  label: string
  floated: boolean
  alignTop?: boolean
  children: ReactNode
}) {
  return (
    <div className="relative">
      {children}
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 origin-left transition-all duration-200 ease-out ${
          floated
            ? 'top-2.5 translate-y-0 text-xs font-normal text-sage'
            : alignTop
              ? 'top-4 translate-y-0 text-sm font-normal text-stone/70'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal text-stone/70'
        }`}
      >
        {label}
      </label>
    </div>
  )
}

type FloatingLabelFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  fieldClassName?: string
}

export function FloatingLabelField({
  label,
  value,
  defaultValue,
  className,
  fieldClassName = defaultFieldClassName,
  id: idProp,
  onFocus,
  onBlur,
  ...props
}: FloatingLabelFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const { setFocused, floated } = useFloatingLabel(value, defaultValue)

  return (
    <div className={className}>
      <FloatingLabel id={id} label={label} floated={floated}>
        <input
          id={id}
          value={value}
          defaultValue={defaultValue}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          className={fieldClassName}
          {...props}
        />
      </FloatingLabel>
    </div>
  )
}

type FloatingLabelSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  fieldClassName?: string
}

export function FloatingLabelSelect({
  label,
  value,
  defaultValue,
  className,
  fieldClassName = defaultFieldClassName,
  id: idProp,
  onFocus,
  onBlur,
  children,
  ...props
}: FloatingLabelSelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const { setFocused, floated } = useFloatingLabel(value, defaultValue)

  return (
    <div className={className}>
      <FloatingLabel id={id} label={label} floated={floated}>
        <select
          id={id}
          value={value}
          defaultValue={defaultValue}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          className={`${fieldClassName} appearance-none bg-[length:1rem_1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235c524c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
          {...props}
        >
          {children}
        </select>
      </FloatingLabel>
    </div>
  )
}

type FloatingLabelTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  fieldClassName?: string
}

export function FloatingLabelTextarea({
  label,
  value,
  defaultValue,
  className,
  fieldClassName = defaultFieldClassName,
  id: idProp,
  onFocus,
  onBlur,
  ...props
}: FloatingLabelTextareaProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const { setFocused, floated } = useFloatingLabel(value, defaultValue)

  return (
    <div className={className}>
      <FloatingLabel id={id} label={label} floated={floated} alignTop>
        <textarea
          id={id}
          value={value}
          defaultValue={defaultValue}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          className={`${fieldClassName} resize-y`}
          {...props}
        />
      </FloatingLabel>
    </div>
  )
}
