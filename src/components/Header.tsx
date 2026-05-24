'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { SiteSettings } from '@/lib/types'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

const navLinks = [
  { href: '/bestill-time', label: 'Bestill time' },
  { href: '/behandling/soneterapi', label: 'Behandlinger' },
  { href: '/kurs', label: 'Kurs' },
  { href: '/boker', label: 'Bøker' },
  { href: '/artikler', label: 'Artikler' },
  { href: '/om-meg', label: 'Om meg' },
  { href: '/priser', label: 'Priser' },
] as const

interface HeaderProps {
  settings: Pick<SiteSettings, 'title' | 'phone'> | null
}

export function Header({ settings }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const phoneDisplay = settings?.phone ? getPhoneDisplay(settings.phone) : null
  const phoneTel = settings?.phone ? getPhoneTel(settings.phone) : null

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-warm-light">
      <div className="container-wide section-padding mx-auto flex items-center justify-between h-16">
        <Link href="/" className="flex flex-col leading-none group">
          <span className="font-serif text-xl font-normal text-stone tracking-tight group-hover:text-sage-dark transition-colors">
            {settings?.title ?? 'Sandnes Soneterapi'}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-sans font-light">
            Terje Horpestad
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Hovednavigasjon">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-sans font-light text-muted hover:text-stone transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
          {phoneDisplay && phoneTel && (
            <a
              href={`tel:${phoneTel}`}
              className="ml-2 px-4 py-2 border border-sage/30 text-sage-dark text-sm font-sans font-light rounded-full hover:bg-sage-light transition-colors tracking-wide"
            >
              {phoneDisplay}
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label={open ? 'Lukk meny' : 'Åpne meny'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span
            className={`block w-6 h-px bg-stone transition-all ${open ? 'rotate-45 translate-y-2' : ''}`}
          />
          <span className={`block w-6 h-px bg-stone transition-all ${open ? 'opacity-0' : ''}`} />
          <span
            className={`block w-6 h-px bg-stone transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`}
          />
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden bg-cream border-t border-warm-light px-6 py-4 flex flex-col gap-4"
          aria-label="Mobilnavigasjon"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-sans font-light text-stone py-1 border-b border-warm-light last:border-0"
            >
              {link.label}
            </Link>
          ))}
          {phoneDisplay && phoneTel && (
            <a
              href={`tel:${phoneTel}`}
              className="mt-2 text-center px-4 py-3 border border-sage/40 text-sage-dark rounded-full font-sans font-light"
            >
              Ring {phoneDisplay}
            </a>
          )}
        </nav>
      )}
    </header>
  )
}
