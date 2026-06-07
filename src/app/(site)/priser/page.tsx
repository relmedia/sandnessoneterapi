import type { Metadata } from 'next'
import { Phone } from 'lucide-react'
import { getPage, getSiteSettings } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Priser',
  description: 'Priser for soneterapi, øreakupunktur og tankefeltterapi i Sandnes.',
}

const defaultPrices = [
  { label: 'Soneterapi – 1 time', price: 'Kontakt for pris' },
  { label: 'Øreakupunktur', price: 'Kontakt for pris' },
  { label: 'Tankefeltterapi', price: 'Kontakt for pris' },
  { label: 'Kurs i soneterapi', price: 'Se kurs-siden' },
] as const

export default async function PriserPage() {
  const [page, settings] = await Promise.all([getPage('priser'), getSiteSettings()])
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)
  const prices = page?.priceList?.length ? page.priceList : defaultPrices

  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <p className="text-label mb-4">
          Oversikt
        </p>
        <h1 className="text-heading-display mb-12">{page?.title ?? 'Priser'}</h1>

        <div className="divide-y divide-warm-light border-t border-b border-warm-light mb-12">
          {prices.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-5 gap-4">
              <span className="font-sans font-normal text-stone">{item.label}</span>
              <span className="font-serif text-xl text-sage-dark text-right">{item.price}</span>
            </div>
          ))}
        </div>

        {page?.body && page.body.length > 0 && (
          <div className="mb-12">
            <PortableTextRenderer value={page.body} />
          </div>
        )}

        {phoneDisplay && phoneTel && (
          <p className="text-body-sm text-sm inline-flex items-center gap-2 flex-wrap">
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            <span>
              Ring{' '}
              <a href={`tel:${phoneTel}`} className="text-sage-dark underline">
                {phoneDisplay}
              </a>{' '}
              for priser og bestilling av time.
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
