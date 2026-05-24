import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getService, getServices, getSiteSettings, publishedQuery, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const services = await getServices(publishedQuery)
  return services.map((service) => ({ slug: service.slug.current }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug, publishedQuery)
  if (!service) return { title: 'Behandling ikke funnet' }
  return {
    title: service.title,
    description: service.shortDescription,
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const [service, settings] = await Promise.all([getService(slug), getSiteSettings()])
  if (!service) notFound()

  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <article className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <nav
          className="flex items-center gap-2 text-xs font-sans font-light text-muted mb-12 uppercase tracking-widest"
          aria-label="Brødsmulesti"
        >
          <Link href="/" className="hover:text-stone transition-colors">
            Forside
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone">{service.title}</span>
        </nav>

        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          Behandling
        </p>
        <h1 className="font-serif text-display text-stone mb-8">{service.title}</h1>

        {service.shortDescription && (
          <p className="font-sans font-light text-xl text-muted leading-relaxed mb-12 border-l-4 border-sage pl-6">
            {service.shortDescription}
          </p>
        )}

        {service.image && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-14 bg-sage-light">
            <Image
              src={urlFor(service.image).width(1200).height(675).url()}
              alt={service.image.alt ?? service.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <PortableTextRenderer value={service.body} />

        <div className="mt-16 p-10 rounded-2xl bg-sage-light text-center">
          <h2 className="font-serif text-2xl text-stone mb-3">Ønsker du en time?</h2>
          <p className="font-sans font-light text-muted mb-6">Bestill online eller ring Terje direkte.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/bestill-time"
              className="inline-block px-8 py-4 bg-sage text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide"
            >
              Bestill time
            </Link>
            <a
              href={`tel:${phoneTel}`}
              className="inline-block px-8 py-4 border border-sage/30 text-sage-dark font-sans font-light text-sm rounded-full hover:bg-sage-light transition-colors tracking-wide"
            >
              Ring {phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
