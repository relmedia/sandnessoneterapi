import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPage, getSanityQueryOptions } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Om meg',
  description:
    'Om Terje Horpestad – soneterapeut, lærer og forfatter med over 35 års erfaring innen soneterapi.',
}

export default async function OmMegPage() {
  const { isEnabled: isDraftMode } = await draftMode()
  const page = await getPage('om-meg', getSanityQueryOptions(isDraftMode))

  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <p className="text-label mb-4">
          Om terapeuten
        </p>
        <h1 className="text-heading-display mb-12">{page?.title ?? 'Om meg'}</h1>

        {page?.body ? (
          <PortableTextRenderer value={page.body} />
        ) : (
          <div className="prose-sanity">
            <p>
              Terje Horpestad har gjennom 35 års daglig erfaring med soneterapibehandlinger utviklet
              et unikt og detaljert sonesystem som har resultert i 3 fagbøker i soneterapi og 1 stk
              fagbok i tankefeltterapi.
            </p>
            <p>
              I 1998 startet han Soneterapiskolen hvor han har vært lærer og rektor. Skolen har vært
              godkjent av Norske Naturterapeuters Hovedorganisasjon siden 1998.
            </p>
            <p>
              Terje er eksaminert soneterapeut v/Naturheilschule i 1986. Han har videreutdanning i
              fotsoneterapi v/Charles Ersdal. I tillegg til eksamener fra Naturheilschule i
              øreakupunktur, urtemedisin, anatomi og fysiologi. Eksamen i tankefeltterapi:
              Alternativet i Stavanger.
            </p>
            <p>
              Sandnes Soneterapi har bedriftsavtaler med flere større bedrifter i Rogaland (blandt
              annet Coop på Bryne). Terje har tidligere i flere år vært leder i forskningskomiteen
              til NNH.
            </p>

            <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone mt-10 mb-4">
              Bøker utgitt av Terje
            </h2>
            <ul>
              <li>
                <em>Ny kunnskap i Soneterapi</em> — ISBN 978-82-997412-2-4
              </li>
              <li>
                <em>New knowledge in reflexotherapy</em> — ISBN 978-82-997412-5-5
              </li>
              <li>
                <em>Tankefeltterapi, akupunktur og meridianlære</em> — ISBN 978-82-997412-4-8
              </li>
              <li>
                <em>Soneterapi i tekst og bilder</em> — ISBN 978-82-997412-8-6
              </li>
            </ul>

            <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone mt-10 mb-4">
              Kurser som Terje har undervist i
            </h2>
            <ul>
              <li>Faglærer ved Sirius Naturterapeutiske skole i Haugesund</li>
              <li>Faglærer i soneterapi i Tromsø på Akademiet Helbred</li>
              <li>Fagkurs i soneterapi for terapeuter i Sandnes, Oslo og Tromsø</li>
              <li>
                Grunnkurs i soneterapi for elever som ønsker å lære soneterapi i lokalene til
                Sandnes Soneterapi
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
