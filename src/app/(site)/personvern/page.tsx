import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPage, getSanityQueryOptions, getSiteSettings } from '@/lib/sanity'
import { LegalPageContent } from '@/components/LegalPageContent'
import { getPhoneDisplay } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Personvern',
  description: 'Personvernerklæring og informasjon om informasjonskapsler hos Sandnes Soneterapi.',
}

export default async function PersonvernPage() {
  const { isEnabled: isDraftMode } = await draftMode()
  const sanityOptions = getSanityQueryOptions(isDraftMode)
  const [page, settings] = await Promise.all([
    getPage('personvern', sanityOptions),
    getSiteSettings(sanityOptions),
  ])

  const contactEmail = settings?.email ?? 'terje@sandnessoneterapi.no'
  const contactPhone = settings?.phone ? getPhoneDisplay(settings.phone) : '450 36 557'

  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <p className="mb-4 font-sans text-xs font-light uppercase tracking-[0.3em] text-sage">
          Juridisk
        </p>
        <h1 className="mb-12 font-serif text-display text-stone">
          {page?.title ?? 'Personvern'}
        </h1>

        <LegalPageContent
          body={page?.body}
          fallback={
            <>
              <p>Sist oppdatert: {new Date().getFullYear()}</p>

              <h2>Behandlingsansvarlig</h2>
              <p>
                {settings?.title ?? 'Sandnes Soneterapi'} v/Terje Horpestad er behandlingsansvarlig
                for personopplysninger som samles inn via nettsiden.
              </p>

              <h2>Hvilke opplysninger vi samler inn</h2>
              <ul>
                <li>Navn, telefon og e-post ved timebestilling, kurspåmelding og bokkjøp</li>
                <li>Leveringsadresse ved bokkjøp</li>
                <li>Betalingsreferanser fra Vipps (vi lagrer ikke kortnummer)</li>
                <li>Teknisk informasjon som nettleser og IP-adresse i serverlogger</li>
              </ul>

              <h2>Formål og grunnlag</h2>
              <p>
                Opplysningene behandles for å gjennomføre bestillinger, sende bekreftelser, yte
                behandling/kurs og oppfylle lovpålagte krav. Grunnlaget er avtale, berettiget
                interesse og/eller samtykke der det kreves.
              </p>

              <h2>Deling av opplysninger</h2>
              <p>
                Vi deler opplysninger med databehandlere som hjelper oss å drifte nettsiden, e-post og
                betaling (for eksempel Vercel, Sanity, Resend og Vipps MobilePay). Disse
                behandler data kun på våre vegne og etter avtale.
              </p>

              <h2>Lagringstid</h2>
              <p>
                Opplysninger lagres så lenge det er nødvendig for formålet, og i henhold til
                bokførings- og regnskapsregler der det gjelder.
              </p>

              <h2>Dine rettigheter</h2>
              <p>
                Du kan be om innsyn, retting, sletting og begrensning av behandlingen, samt protestere
                mot behandling og be om dataportabilitet der det er relevant. Klage kan sendes til
                Datatilsynet.
              </p>

              <h2>Informasjonskapsler (cookies)</h2>
              <p>Nettsiden bruker følgende typer informasjonskapsler:</p>
              <ul>
                <li>
                  <strong>Nødvendige:</strong> lagring av cookie-valg og teknisk drift av skjema og
                  bestilling.
                </li>
                <li>
                  <strong>Funksjonelle/sikkerhet:</strong> Cloudflare Turnstile kan sette cookies for
                  å hindre misbruk av skjema når dette er aktivert.
                </li>
                <li>
                  <strong>Betaling:</strong> Vipps kan sette cookies i betalingsvinduet når du betaler
                  for kurs eller bøker.
                </li>
              </ul>
              <p>
                Vi bruker ikke markedsførings- eller analyseverktøy som Google Analytics. Du kan når
                som helst endre cookie-valget ved å slette lagret informasjon i nettleseren og laste
                siden på nytt.
              </p>

              <h2>Kontakt</h2>
              <p>
                Spørsmål om personvern kan sendes til{' '}
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a> eller telefon {contactPhone}.
              </p>
            </>
          }
        />
      </div>
    </div>
  )
}
