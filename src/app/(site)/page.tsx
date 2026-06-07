import Link from 'next/link'
import Image from 'next/image'
import { CourseCard } from '@/components/CourseCard'
import { ServiceCard } from '@/components/ServiceCard'
import { getSiteSettings, getServices, getCourses, urlFor } from '@/lib/sanity'
import { mapServiceCards } from '@/lib/service-fallbacks'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export default async function HomePage() {
  const [settings, services, courses] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getCourses(),
  ])

  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)
  const upcomingCourses = courses.slice(0, 3)
  const serviceCards = mapServiceCards(services)
  const heroImage = settings?.heroImage
  const heroImageWidth = heroImage?.dimensions?.width ?? 600
  const heroImageHeight = heroImage?.dimensions?.height ?? 969
  const heroImageAlt = heroImage?.alt ?? 'Terje Horpestad, soneterapeut'

  return (
    <>
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-warm-light opacity-40 blur-2xl pointer-events-none"
        />

        <div className="container-wide section-padding mx-auto py-24 md:py-36 relative">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14 [&>*]:min-w-0">
            <p className="text-label lg:col-start-1 lg:row-start-1">
              Godkjent av NNH – Norske Naturterapeuters Hovedorganisasjon
            </p>
            <h1 className="text-heading-display leading-tight whitespace-pre-line lg:col-start-1 lg:row-start-2">
              {settings?.heroHeading ?? 'Naturlig helse\ngjennom berøring'}
            </h1>
            <p className="text-readable max-w-lg text-lg md:text-xl lg:col-start-1 lg:row-start-3">
              {settings?.heroBody ??
                'Terje Horpestad er godkjent soneterapeut med over 40 års daglig erfaring. Han tilbyr soneterapi, øreakupunktur og tankefeltterapi i Sandnes.'}
            </p>

            <div className="relative z-10 mx-auto w-[180px] shrink-0 sm:w-[200px] lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mx-0 lg:w-[220px] lg:self-center xl:w-[240px]">
              <Image
                src={
                  heroImage
                    ? urlFor(heroImage).width(480).url()
                    : '/images/terje_profil.png'
                }
                alt={heroImageAlt}
                width={heroImageWidth}
                height={heroImageHeight}
                className="h-auto w-full"
                priority
                sizes="(max-width: 1024px) 200px, 240px"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--color-cream)),linear-gradient(to_right,transparent_60%,var(--color-cream))]"
              />
            </div>

            <div className="flex flex-row flex-nowrap items-center gap-2 sm:gap-4 lg:col-start-1 lg:row-start-4">
              <Link
                href="/bestill-time"
                className="shrink-0 rounded-full bg-stone px-4 py-3 font-sans text-xs font-normal tracking-wide whitespace-nowrap text-cream transition-colors hover:bg-sage-dark sm:px-8 sm:py-4 sm:text-sm"
              >
                Bestill time
              </Link>
              <Link
                href="#behandlinger"
                className="shrink-0 rounded-full border border-stone/30 px-4 py-3 font-sans text-xs font-normal tracking-wide whitespace-nowrap text-stone transition-colors hover:border-sage hover:text-sage-dark sm:px-8 sm:py-4 sm:text-sm"
              >
                Les mer om behandlinger
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-warm/30 to-transparent" />

      <section id="behandlinger" className="bg-gradient-to-b from-cream to-warm-light/40 py-20 md:py-28 scroll-mt-20">
        <div className="container-wide section-padding mx-auto">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 text-label">
              Behandlinger
            </p>
            <h2 className="text-heading-hero">Hva kan jeg hjelpe deg med?</h2>
            <p className="text-readable mt-4 text-stone/90">
              Skånsomme, erfaringsbaserte metoder tilpasset dine behov — enten du søker avspenning,
              balanse eller støtte i en utfordrende periode.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {serviceCards.map((service) => (
              <ServiceCard
                key={service.key}
                title={service.title}
                slug={service.slug}
                description={service.description}
                image={service.image}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-light py-20 md:py-28">
        <div className="container-wide section-padding mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-label mb-4">
              Om terapeuten
            </p>
            <h2 className="text-heading-hero mb-6">40 år med daglig erfaring</h2>
            <p className="text-readable mb-4 text-stone/90">
              Terje Horpestad har over 40 års daglig erfaring innen soneterapi og alternativ medisin.
              Han er godkjent av Norske Naturterapeuters Hovedorganisasjon (NNH) og har utdannet
              terapeuter gjennom Soneterapiskolen i over 20 år.
            </p>
            <p className="text-readable mb-8 text-stone/90">
              Han har skrevet to bøker om soneterapi og et hefte om tankefeltterapi og meridianlære,
              og holder foredrag om soneterapi, helse og kroppen i bevegelse.
            </p>
            <Link
              href="/om-meg"
              className="inline-block px-6 py-3 border border-stone/40 text-stone text-sm font-sans font-normal rounded-full hover:bg-stone hover:text-cream transition-colors tracking-wide"
            >
              Mer om Terje →
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { label: '40+', desc: 'Års daglig erfaring' },
              { label: '20+', desc: 'År som utdanner' },
              { label: 'NNH', desc: 'Godkjent terapeut' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-6 p-6 bg-cream rounded-2xl">
                <span className="font-serif text-4xl text-sage-dark font-normal">{stat.label}</span>
                <span className="font-sans text-base font-normal text-stone/90">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {upcomingCourses.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-wide section-padding mx-auto">
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-label mb-3">
                  Kommende kurs
                </p>
                <h2 className="text-heading-hero">Kurs og utdanning</h2>
              </div>
              <Link
                href="/kurs"
                className="hidden md:block text-body-sm font-sans hover:text-stone transition-colors"
              >
                Se alle kurs →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {upcomingCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-sage pt-20 md:pt-28">
        <div className="container-wide section-padding mx-auto pb-16 md:pb-20 text-center">
          <h2 className="text-heading-display text-cream mb-6">Klar for en behandling?</h2>
          <p className="font-sans font-normal text-cream/95 text-lg mb-10 max-w-md mx-auto">
            Bestill time online eller ring for å avtale. Velkommen til Industrigata 1 i Sandnes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/bestill-time"
              className="inline-block px-10 py-5 bg-cream text-stone font-sans font-normal rounded-full hover:bg-warm-light transition-colors tracking-wide text-lg"
            >
              Bestill time
            </Link>
            <a
              href={`tel:${phoneTel}`}
              className="inline-block px-10 py-5 border border-cream/40 text-cream font-sans font-normal rounded-full hover:bg-cream/10 transition-colors tracking-wide text-lg"
            >
              Ring {phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
