import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import type { SiteSettings } from '@/lib/types'
import { getPhoneDisplay, getPhoneTel, getGoogleMapsUrl, isSafeExternalUrl } from '@/lib/utils'

interface FooterProps {
  settings: Pick<
    SiteSettings,
    'title' | 'phone' | 'email' | 'address' | 'facebookUrl' | 'nnh'
  > | null
}

const footerLinks = [
  ['/', 'Forside'],
  ['/bestill-time', 'Bestill time'],
  ['/avbestill', 'Avbestill time'],
  ['/kurs', 'Kurs'],
  ['/foredrag', 'Foredrag'],
  ['/boker', 'Bøker'],
  ['/artikler', 'Artikler'],
  ['/om-meg', 'Om meg'],
  ['/priser', 'Priser'],
] as const

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear()
  const phoneDisplay = settings?.phone ? getPhoneDisplay(settings.phone) : null
  const phoneTel = settings?.phone ? getPhoneTel(settings.phone) : null
  const facebookUrl =
    settings?.facebookUrl && isSafeExternalUrl(settings.facebookUrl)
      ? settings.facebookUrl
      : null

  return (
    <footer className="bg-stone text-cream/80">
      <div className="container-wide section-padding mx-auto py-16 grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-serif text-2xl font-light text-cream mb-3">
            {settings?.title ?? 'Sandnes Soneterapi'}
          </h3>
          <p className="font-sans font-light text-sm leading-relaxed text-cream/60">
            Terje Horpestad – godkjent soneterapeut med over 40 års erfaring.
          </p>
          {settings?.nnh && (
            <p className="mt-4 text-xs uppercase tracking-widest text-warm font-sans">
              NNH-godkjent
            </p>
          )}
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-warm mb-4">
            Navigasjon
          </h4>
          <nav className="flex flex-col gap-2" aria-label="Bunnnavigasjon">
            {footerLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-sans font-light text-cream/70 hover:text-cream transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-warm mb-4">Kontakt</h4>
          <div className="flex flex-col gap-2 text-sm font-sans font-light text-cream/70">
            {phoneDisplay && phoneTel && (
              <a
                href={`tel:${phoneTel}`}
                className="inline-flex items-center gap-2 hover:text-cream transition-colors"
              >
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {phoneDisplay}
              </a>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 hover:text-cream transition-colors"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {settings.email}
              </a>
            )}
            {settings?.address && (
              <a
                href={getGoogleMapsUrl(settings.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-cream"
              >
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {settings.address}
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cream transition-colors"
              >
                Facebook →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6 section-padding text-center text-xs text-cream/30 font-sans font-light">
        © {year} Sandnes Soneterapi · Terje Horpestad
      </div>
    </footer>
  )
}
