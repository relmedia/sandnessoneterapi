import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings, getServices, getCourses, urlFor } from '@/lib/sanity'
import { formatDateNb, getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

const fallbackServices = [
  {
    title: 'Soneterapi',
    emoji: '🦶',
    desc: 'Refleksologi på føttene som påvirker hele kroppen gjennom sonekartet.',
    slug: 'soneterapi',
  },
  {
    title: 'Øreakupunktur',
    emoji: '👂',
    desc: 'Stimulering av akupunkturpunkter i øret for balanse og velvære.',
    slug: 'oreakupunktur',
  },
  {
    title: 'Tankefeltterapi',
    emoji: '🧠',
    desc: 'Behandling av negative tanke- og følelsesmønstre via energisystemet.',
    slug: 'tankefeltterapi',
  },
] as const

export default async function HomePage() {
  const [settings, services, courses] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getCourses(),
  ])

  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)
  const upcomingCourses = courses.slice(0, 3)

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
                href="/behandling/soneterapi"
                className="px-8 py-4 border border-stone/30 text-stone font-sans font-light text-sm rounded-full hover:border-sage hover:text-sage-dark transition-colors tracking-wide"
              >
                Les mer om behandlinger
              </Link>
            </div>
            {settings?.address && (
              <p className="mt-8 text-xs text-muted font-sans font-light tracking-wide">
                📍 {settings.address}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-warm/30 to-transparent" />

      <section className="py-20 md:py-28">
        <div className="container-wide section-padding mx-auto">
          <div className="mb-14">
            <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-3">
              Behandlinger
            </p>
            <h2 className="font-serif text-hero text-stone">Hva kan jeg hjelpe deg med?</h2>
          </div>

          {services.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/behandling/${service.slug.current}`}
                  className="group block"
                >
                  {service.image ? (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-sage-light">
                      <Image
                        src={urlFor(service.image).width(600).height(450).url()}
                        alt={service.image.alt ?? service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-2xl bg-sage-light mb-5 flex items-center justify-center">
                      <span className="text-4xl" aria-hidden="true">
                        🌿
                      </span>
                    </div>
                  )}
                  <h3 className="font-serif text-2xl font-normal text-stone mb-2 group-hover:text-sage-dark transition-colors">
                    {service.title}
                  </h3>
                  {service.shortDescription && (
                    <p className="font-sans font-light text-sm text-muted leading-relaxed">
                      {service.shortDescription}
                    </p>
                  )}
                  <span className="inline-block mt-4 text-xs uppercase tracking-widest text-sage font-sans">
                    Les mer →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {fallbackServices.map((item) => (
                <Link key={item.title} href={`/behandling/${item.slug}`} className="group block">
                  <div className="aspect-[4/3] rounded-2xl bg-sage-light mb-5 flex items-center justify-center">
                    <span className="text-5xl" aria-hidden="true">
                      {item.emoji}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-stone mb-2">{item.title}</h3>
                  <p className="font-sans font-light text-sm text-muted leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          )}
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

            <div className="grid md:grid-cols-3 gap-6">
              {upcomingCourses.map((course) => (
                <Link
                  key={course._id}
                  href="/kurs"
                  className="block p-8 rounded-2xl border border-warm-light hover:border-sage/30 hover:bg-sage-light/30 transition-colors group"
                >
                  {course.startDate && (
                    <p className="font-sans text-xs text-sage uppercase tracking-widest mb-3">
                      {formatDateNb(course.startDate, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  <h3 className="font-serif text-xl text-stone mb-3 group-hover:text-sage-dark transition-colors">
                    {course.title}
                  </h3>
                  {course.shortDescription && (
                    <p className="font-sans font-light text-sm text-muted leading-relaxed mb-4">
                      {course.shortDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-sans font-light text-muted">
                    {course.location && <span>📍 {course.location}</span>}
                    {course.price != null && (
                      <span>{course.price.toLocaleString('nb-NO')} kr</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-sage py-20 md:py-28">
        <div className="container-wide section-padding mx-auto text-center">
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
