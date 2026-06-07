import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getService, getServices, getSiteSettings, publishedQuery, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { ServiceBodyFallback } from '@/components/ServiceBodyFallback'
import { getServiceFallback, resolveServiceShortDescription } from '@/lib/service-fallbacks'
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
  const description = resolveServiceShortDescription(slug, service.shortDescription)
  return {
    title: service.title,
    description,
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const [service, settings] = await Promise.all([getService(slug), getSiteSettings()])
  if (!service) notFound()

  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)
  const fallback = getServiceFallback(slug)
  const shortDescription = resolveServiceShortDescription(slug, service.shortDescription)
  const bodyParagraphs = fallback?.bodyParagraphs

  return (
    <article className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <nav
          className="mb-12 flex items-center gap-2 text-caption uppercase tracking-widest"
          aria-label="Brødsmulesti"
        >
          <Link href="/" className="hover:text-stone transition-colors">
            Forside
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone">{service.title}</span>
        </nav>

        <p className="mb-4 text-label">
          Behandling
        </p>
        <h1 className="mb-8 text-heading-display">{service.title}</h1>

        {shortDescription && (
          <p className="mb-12 max-w-3xl text-body-lg border-l-4 border-sage pl-6">
            {shortDescription}
          </p>
        )}

        {service.image && (
          <div className="relative mb-14 aspect-video overflow-hidden rounded-2xl bg-sage-light">
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

        {bodyParagraphs ? (
          <ServiceBodyFallback paragraphs={bodyParagraphs} />
        ) : (
          <PortableTextRenderer value={service.body} />
        )}

        <div className="mt-16 rounded-2xl bg-sage-light p-10 text-center">
          <h2 className="text-heading-section mb-3">Ønsker du en time?</h2>
          <p className="text-body-sm mb-6">Bestill online eller ring Terje direkte.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/bestill-time"
              className="inline-block px-8 py-4 bg-sage text-cream font-sans text-sm font-normal rounded-full hover:bg-sage-dark transition-colors tracking-wide"
            >
              Bestill time
            </Link>
            <a
              href={`tel:${phoneTel}`}
              className="inline-block px-8 py-4 border border-sage/30 text-sage-dark font-sans text-sm font-normal rounded-full hover:bg-sage-light transition-colors tracking-wide"
            >
              Ring {phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
