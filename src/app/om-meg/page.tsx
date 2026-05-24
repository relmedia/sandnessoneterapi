import type { Metadata } from 'next'
import { getPage, getSiteSettings } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Om meg',
  description: 'Om Terje Horpestad – godkjent soneterapeut med over 40 års erfaring.',
}

export default async function OmMegPage() {
  const [page, settings] = await Promise.all([getPage('om-meg'), getSiteSettings()])
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          Om terapeuten
        </p>
        <h1 className="font-serif text-display text-stone mb-12">{page?.title ?? 'Om meg'}</h1>

        {page?.body ? (
          <PortableTextRenderer value={page.body} />
        ) : (
          <div className="prose-sanity">
            <p>
              Terje Horpestad er godkjent soneterapeut og har over 40 års daglig erfaring innen
              soneterapi og alternativ medisin. Han er medlem av og godkjent av Norske
              Naturterapeuters Hovedorganisasjon (NNH).
            </p>
            <p>
              Gjennom Soneterapiskolen har Terje utdannet soneterapeuter i over 20 år, og han har
              skrevet to bøker om soneterapi samt et hefte om tankefeltterapi og meridianlære.
            </p>
            <p>
              Han tar imot klienter i sine lokaler på{' '}
              <strong>Sandnes Naturmedisinske Senter, Industrigata 1, 4307 Sandnes</strong>.
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone mt-10 mb-4">
              Kontakt
            </h2>
            <p>
              📞{' '}
              <a href={`tel:${phoneTel}`} className="text-sage-dark underline">
                {phoneDisplay}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
