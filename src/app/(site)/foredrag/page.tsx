import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Mic2, Phone } from 'lucide-react'
import { getPage, getSiteSettings, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'
import type { SanityImage } from '@/lib/types'

export const revalidate = 3600

function HeroImage({ image, alt }: { image: SanityImage; alt: string }) {
  const width = image.dimensions?.width ?? 480
  const height = image.dimensions?.height ?? Math.round(width * 0.625)

  return (
    <figure className="overflow-hidden rounded-2xl bg-sage-light shadow-sm ring-1 ring-stone/5">
      <Image
        src={urlFor(image).width(640).url()}
        alt={image.alt ?? alt}
        width={width}
        height={height}
        className="h-auto w-full"
        priority
        sizes="(max-width: 1024px) 100vw, 384px"
      />
      {image.caption && (
        <figcaption className="border-t border-warm-light px-4 py-3 font-sans text-sm font-light text-muted">
          {image.caption}
        </figcaption>
      )}
    </figure>
  )
}

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
      <section className="border-b border-warm-light bg-gradient-to-b from-cream via-cream to-warm-light/40 py-14 md:py-20">
        <div className="container-wide section-padding mx-auto">
          <nav
            className="mb-10 flex items-center gap-2 font-sans text-xs font-light uppercase tracking-widest text-muted"
            aria-label="Brødsmulesti"
          >
            <Link href="/" className="transition-colors hover:text-stone">
              Forside
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-stone">Foredrag</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,384px)] lg:items-start lg:gap-14">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-sage-light/60 px-4 py-1.5 font-sans text-xs font-light uppercase tracking-widest text-sage-dark">
                <Mic2 className="size-3.5" aria-hidden />
                Formidling
              </div>
              <h1 className="max-w-2xl font-serif text-hero text-stone">{pageTitle}</h1>
              {!page?.body && (
                <p className="mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-muted md:text-lg">
                  Lærerike foredrag om soneterapi, helse og kroppen i ro og i bevegelse — tilpasset
                  bedrifter, foreninger og fagmiljøer.
                </p>
              )}
            </div>

            {heroImage && (
              <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
                <HeroImage image={heroImage} alt={pageTitle} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-wide section-padding mx-auto">
          <div className="mx-auto max-w-3xl">
            {page?.body ? (
              <PortableTextRenderer value={page.body} />
            ) : (
              <div className="prose-sanity">
                <p>
                  Terje Horpestad holder foredrag om soneterapi, helse og kroppen i bevegelse. Med
                  over 40 års daglig erfaring formidler han hvordan kroppen kan forstås og støttes
                  gjennom soneterapi og naturlige helsemetoder.
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
              <figure key={image.asset._ref ?? index} className="my-10 overflow-hidden rounded-2xl">
                <Image
                  src={urlFor(image).width(900).url()}
                  alt={image.alt ?? pageTitle}
                  width={image.dimensions?.width ?? 900}
                  height={image.dimensions?.height ?? 563}
                  className="h-auto w-full rounded-2xl"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
                {image.caption && (
                  <figcaption className="mt-3 font-sans text-sm font-light italic text-muted">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-wide section-padding mx-auto">
          <div className="overflow-hidden rounded-2xl bg-stone">
            <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12 md:p-12">
              <div>
                <h2 className="font-serif text-2xl text-cream md:text-3xl">Bestill foredrag</h2>
                <p className="mt-3 max-w-lg font-sans text-sm font-light leading-relaxed text-cream/75 md:text-base">
                  Ta kontakt for tilbud, tilgjengelighet og praktisk gjennomføring. Terje tilpasser
                  innhold og lengde etter deres behov.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <a
                  href={`tel:${phoneTel}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 font-sans text-sm font-light tracking-wide text-stone transition-colors hover:bg-warm-light"
                >
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {phoneDisplay}
                </a>
                {settings?.email && (
                  <a
                    href={`mailto:${settings.email}?subject=${encodeURIComponent('Forespørsel om foredrag')}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/30 px-6 py-3.5 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-cream/10"
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
