'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { SiteSettings } from '@/lib/types'

const navLinks = [
  { href: '/kurs', label: 'Kurs' },
  { href: '/foredrag', label: 'Foredrag' },
  { href: '/boker', label: 'Bøker' },
  { href: '/artikler', label: 'Artikler' },
  { href: '/om-meg', label: 'Om meg' },
  { href: '/priser', label: 'Priser' },
] as const

type NavService = {
  title: string
  slug: string
}

interface HeaderProps {
  settings: Pick<SiteSettings, 'title'> | null
  services: NavService[]
}

function BehandlingerDropdown({ services }: { services: NavService[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-sans font-light text-muted transition-colors tracking-wide hover:text-stone"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        Behandlinger
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <div
        className={`absolute left-0 top-full z-50 pt-3 transition-all duration-200 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <ul
          className="min-w-[220px] overflow-hidden rounded-xl border border-warm-light bg-cream py-2 shadow-lg"
          role="menu"
        >
          {services.map((service) => (
            <li key={service.slug} role="none">
              <Link
                href={`/behandling/${service.slug}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 font-sans text-sm font-light text-muted transition-colors hover:bg-sage-light/60 hover:text-stone"
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Header({ settings, services }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [behandlingerOpen, setBehandlingerOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-warm-light">
      <div className="container-wide section-padding mx-auto flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex shrink-0 flex-col leading-none">
          <span className="font-serif text-xl font-normal tracking-tight text-stone transition-colors group-hover:text-sage-dark">
            {settings?.title ?? 'Sandnes Soneterapi'}
          </span>
          <span className="font-sans text-[10px] font-light uppercase tracking-[0.2em] text-muted">
            Terje Horpestad
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 md:flex" aria-label="Hovednavigasjon">
            <BehandlingerDropdown services={services} />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-sans font-light tracking-wide text-muted transition-colors hover:text-stone"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex shrink-0 flex-col gap-1.5 p-1 md:hidden"
            aria-label={open ? 'Lukk meny' : 'Åpne meny'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span
              className={`block h-px w-6 bg-stone transition-all ${open ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span className={`block h-px w-6 bg-stone transition-all ${open ? 'opacity-0' : ''}`} />
            <span
              className={`block h-px w-6 bg-stone transition-all ${open ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-4 border-t border-warm-light bg-cream px-6 py-4 md:hidden"
          aria-label="Mobilnavigasjon"
        >
          <div className="border-b border-warm-light pb-4">
            <button
              type="button"
              onClick={() => setBehandlingerOpen((prev) => !prev)}
              className="flex w-full items-center justify-between py-1 font-sans text-base font-light text-stone"
              aria-expanded={behandlingerOpen}
            >
              Behandlinger
              <ChevronDown
                className={`h-4 w-4 transition-transform ${behandlingerOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {behandlingerOpen && (
              <div className="mt-2 flex flex-col gap-2 pl-3">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/behandling/${service.slug}`}
                    onClick={() => {
                      setOpen(false)
                      setBehandlingerOpen(false)
                    }}
                    className="py-1 font-sans text-sm font-light text-muted transition-colors hover:text-stone"
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-warm-light py-1 font-sans text-base font-light text-stone last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
