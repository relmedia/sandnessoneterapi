import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { getPage, getSiteSettings, getSanityImageAspectStyle, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('foredrag')
  return {
    title: page?.title ?? 'Foredrag',
    description:
      'Terje Horpestad holder foredrag om soneterapi, helse og kroppen i bevegelse. Bestill foredrag for bedrifter, foreninger og kurs.',
  }
}

export default async function ForedragPage() {
  const [page, settings] = await Promise.all([getPage('foredrag'), getSiteSettings()])
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)
  const heroImage = page?.sidebarImages?.[0]
  const extraImages = page?.sidebarImages?.slice(1) ?? []
  const pageTitle = page?.title ?? 'Foredrag'

  return (
    <article>
      <section className="relative overflow-hidden border-b border-warm-light/80 bg-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-sage-light/60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-warm-light/50 blur-3xl"
        />

        <div className="container-wide section-padding relative mx-auto py-12 md:py-16 lg:py-20">
          <nav
            className="mb-10 flex items-center gap-2 font-sans text-xs font-light uppercase tracking-widest text-muted md:mb-12"
            aria-label="Brødsmulesti"
          >
            <Link href="/" className="transition-colors hover:text-stone">
              Forside
            </Link>
            <span aria-hidden>/</span>
            <span className="text-stone">Foredrag</span>
          </nav>

          <div className="max-w-2xl">
            <p className="mb-5 font-sans text-xs font-light uppercase tracking-[0.3em] text-sage">
              Formidling
            </p>
            <h1 className="font-serif text-hero leading-[1.12] text-stone md:text-[clamp(2.25rem,4vw,3.5rem)]">
              {pageTitle}
            </h1>
            <p className="mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-muted md:text-lg">
              Inspirerende og praktiske foredrag om soneterapi og helse — tilpasset bedrifter,
              foreninger og fagmiljøer.
            </p>
            <a
              href="#bestill-foredrag"
              className="mt-8 inline-flex items-center rounded-full bg-stone px-7 py-3.5 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              Kontakt for foredrag
            </a>
          </div>

          {heroImage && (
            <div
              className="relative mt-10 overflow-hidden rounded-2xl bg-sage-light shadow-sm ring-1 ring-stone/5 md:mt-12"
              style={getSanityImageAspectStyle(heroImage)}
            >
              <Image
                src={urlFor(heroImage).width(1400).url()}
                alt={heroImage.alt ?? pageTitle}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-wide section-padding mx-auto">
          {page?.body ? (
            <PortableTextRenderer value={page.body} />
          ) : (
            <div className="prose-sanity">
              <p>
                Terje Horpestad holder foredrag om soneterapi, helse og kroppen i bevegelse. Med over
                40 års daglig erfaring formidler han hvordan kroppen kan forstås og støttes gjennom
                soneterapi og naturlige helsemetoder.
              </p>
              <p>
                Foredragene passer for bedrifter, foreninger, skoler og fagmiljøer som ønsker
                inspirasjon og praktisk kunnskap om kroppens signaler, avspenning og egenomsorg.
              </p>

              <h2>Typiske temaer</h2>
              <ul>
                <li>Introduksjon til soneterapi og sonekartet</li>
                <li>Kroppen i bevegelse – helse, stress og balanse</li>
                <li>Praktiske tips for avspenning og egenbehandling</li>
                <li>Soneterapi i arbeidslivet og bedriftshelse</li>
              </ul>

              <p>
                Innhold og lengde tilpasses etter ønske. Ta kontakt for tilbud, tilgjengelighet og
                priser.
              </p>
            </div>
          )}

          {extraImages.map((image, index) => (
            <figure key={image.asset._ref ?? index} className="my-12">
              <div
                className="relative overflow-hidden rounded-2xl bg-sage-light"
                style={getSanityImageAspectStyle(image)}
              >
                <Image
                  src={urlFor(image).width(900).url()}
                  alt={image.alt ?? pageTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1152px) 100vw, 1152px"
                />
              </div>
              {image.caption && (
                <figcaption className="mt-3 font-sans text-sm font-light italic text-muted">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}

          <div id="bestill-foredrag" className="mt-16 overflow-hidden rounded-2xl bg-stone">
            <div className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <h2 className="font-serif text-2xl text-cream md:text-3xl">Bestill foredrag</h2>
                <p className="mt-2 max-w-md font-sans text-sm font-light leading-relaxed text-cream/75 md:text-base">
                  Ta kontakt for tilbud, tilgjengelighet og praktisk gjennomføring. Terje tilpasser
                  innhold og lengde etter deres behov.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${phoneTel}`}
                  className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-sans text-sm font-light tracking-wide text-stone transition-colors hover:bg-warm-light"
                >
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {phoneDisplay}
                </a>
                {settings?.email && (
                  <a
                    href={`mailto:${settings.email}?subject=${encodeURIComponent('Forespørsel om foredrag')}`}
                    className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-6 py-3 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-cream/10"
                  >
                    <Mail className="size-4 shrink-0" aria-hidden />
                    Send e-post
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
