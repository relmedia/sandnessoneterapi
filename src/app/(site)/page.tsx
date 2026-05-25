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
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sage-light opacity-60 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-warm-light opacity-40 blur-2xl pointer-events-none"
        />

        <div className="container-wide section-padding mx-auto py-24 md:py-36 relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-14">
            <div className="max-w-2xl">
              <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-6">
                Godkjent av NNH – Norske Naturterapeuters Hovedorganisasjon
              </p>
              <h1 className="font-serif text-display text-stone mb-8 leading-tight whitespace-pre-line">
                {settings?.heroHeading ?? 'Naturlig helse\ngjennom berøring'}
              </h1>
              <p className="font-sans font-light text-lg md:text-xl text-muted leading-relaxed mb-10 max-w-lg">
                {settings?.heroBody ??
                  'Terje Horpestad er godkjent soneterapeut med over 40 års daglig erfaring. Han tilbyr soneterapi, øreakupunktur og tankefeltterapi i Sandnes.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/bestill-time"
                  className="px-8 py-4 bg-stone text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide"
                >
                  Bestill time
                </Link>
                <Link
                  href="#behandlinger"
                  className="px-8 py-4 border border-stone/30 text-stone font-sans font-light text-sm rounded-full hover:border-sage hover:text-sage-dark transition-colors tracking-wide"
                >
                  Les mer om behandlinger
                </Link>
              </div>
            </div>

            <div className="relative z-10 mx-auto hidden w-[220px] shrink-0 self-center lg:mx-0 lg:block xl:w-[240px]">
              <Image
                src={
                  heroImage
                    ? urlFor(heroImage).width(480).url()
                    : '/images/terje-horpestad.png'
                }
                alt={heroImageAlt}
                width={heroImageWidth}
                height={heroImageHeight}
                className="h-auto w-full"
                priority
                sizes="240px"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--color-cream)),linear-gradient(to_right,transparent_60%,var(--color-cream))]"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-warm/30 to-transparent" />

      <section id="behandlinger" className="bg-gradient-to-b from-cream to-warm-light/40 py-20 md:py-28 scroll-mt-20">
        <div className="container-wide section-padding mx-auto">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-sans text-xs font-light uppercase tracking-[0.3em] text-sage">
              Behandlinger
            </p>
            <h2 className="font-serif text-hero text-stone">Hva kan jeg hjelpe deg med?</h2>
            <p className="mt-4 font-sans text-base font-light leading-relaxed text-muted">
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
            <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
              Om terapeuten
            </p>
            <h2 className="font-serif text-hero text-stone mb-6">40 år med daglig erfaring</h2>
            <p className="font-sans font-light text-muted leading-relaxed mb-4">
              Terje Horpestad har over 40 års daglig erfaring innen soneterapi og alternativ medisin.
              Han er godkjent av Norske Naturterapeuters Hovedorganisasjon (NNH) og har utdannet
              terapeuter gjennom Soneterapiskolen i over 20 år.
            </p>
            <p className="font-sans font-light text-muted leading-relaxed mb-8">
              Han har skrevet to bøker om soneterapi og et hefte om tankefeltterapi og meridianlære,
              og holder foredrag om soneterapi, helse og kroppen i bevegelse.
            </p>
            <Link
              href="/om-meg"
              className="inline-block px-6 py-3 border border-stone/40 text-stone text-sm font-sans font-light rounded-full hover:bg-stone hover:text-cream transition-colors tracking-wide"
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
                <span className="font-serif text-4xl text-sage-dark font-light">{stat.label}</span>
                <span className="font-sans font-light text-muted">{stat.desc}</span>
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
                <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-3">
                  Kommende kurs
                </p>
                <h2 className="font-serif text-hero text-stone">Kurs og utdanning</h2>
              </div>
              <Link
                href="/kurs"
                className="hidden md:block text-sm text-muted font-sans font-light hover:text-stone transition-colors"
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
          <h2 className="font-serif text-display text-cream mb-6">Klar for en behandling?</h2>
          <p className="font-sans font-light text-cream/80 text-lg mb-10 max-w-md mx-auto">
            Bestill time online eller ring for å avtale. Velkommen til Industrigata 1 i Sandnes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/bestill-time"
              className="inline-block px-10 py-5 bg-cream text-stone font-sans font-light rounded-full hover:bg-warm-light transition-colors tracking-wide text-lg"
            >
              Bestill time
            </Link>
            <a
              href={`tel:${phoneTel}`}
              className="inline-block px-10 py-5 border border-cream/40 text-cream font-sans font-light rounded-full hover:bg-cream/10 transition-colors tracking-wide text-lg"
            >
              Ring {phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
