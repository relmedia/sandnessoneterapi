import type { ServiceListItem } from '@/lib/types'

export interface ServiceFallbackContent {
  shortDescription: string
  bodyParagraphs: string[]
}

export const serviceFallbacks: Record<string, ServiceFallbackContent> = {
  tankefeltterapi: {
    shortDescription:
      'Tankefeltterapi (TFT) kombinerer kroppens energibaner med samtaleterapi, og brukes ved stress, angst, fobier, traumer og smerter. Terapeuten banker lett på meridianpunkter mens du holder fokus på problemet.',
    bodyParagraphs: [
      'Tankefeltterapi (TFT) kan gi forbløffende resultater, noe som forutsetter at klienten klarer å være tilstede i sine ubehagelige følelser eller smerter. For de fleste klienter blir dette en ny mulighet til å bli kjent med nye sider inni seg selv. Smerter og vonde tabubelagte følelser er «noe» vi i vår kultur holder avstand til og ofte fortrenger. Har vi vondt i hodet, spiser vi smertestillende piller, og når vi er triste, bruker mange såkalte lykkepiller. Forbruket av antidepressive midler har økt betraktelig de siste årene. Årsaken kan muligens skyldes at livet er blitt så travelt at mange mister den indre kontakten med seg selv. «Hvorfor drikker Jeppe?»',
      'Smertene bør sees som viktige nøkler til å bli bedre kjent med oss selv og gi økt innsikt til nye indre kvaliteter og ressurser. Folkeeventyr er ofte gode historier som speiler ulike sider av menneskesinnet. Eventyret om prinsessen som kysser den slimete, ekle frosken som forvandler seg til en flott prins, er ett godt eksempel på dette. Når vi dukker ned i vannet/følelsene våre og våger å «møte» det vi er redd for, skjer det ofte en indre magisk forandring.',
      'Tankefeltterapi kombinerer Østens viten om kroppens energibaner (meridianer) med psykologisk samtaleterapi. Resultatet er en behandling som brukes til behandling av stress, angst, røykeavhengighet, tvangshandlinger, fobier, traumer, søvnbesvær, vektproblemer, anspenthet, uro, smerter, flyskrekk m.m.',
      'Behandling med tankefeltterapi foregår ved at terapeuten banker lett med fingerspissene på bestemte punkter i ansiktet, kroppen og på hendene (meridianpunkter) mens klienten holder fokus på det problemet som behandles.',
      'Tankefeltterapi er en spennende terapiform. Jeg lærer ofte pasienten hvordan man kan behandle seg selv for å dempe symptomene sine når terapeuten ikke er tilstede.',
      'Tankefeltterapi tar ikke bort evnen til å føle frykt eller angst, men intensiteten i det ubehagelige.',
    ],
  },
}

export function getServiceFallback(slug: string): ServiceFallbackContent | undefined {
  return serviceFallbacks[slug]
}

export function resolveServiceShortDescription(
  slug: string,
  cmsDescription?: string
): string | undefined {
  return getServiceFallback(slug)?.shortDescription ?? cmsDescription
}

const defaultServiceCards = [
  {
    title: 'Soneterapi',
    slug: 'soneterapi',
    description: 'Refleksologi på føttene som påvirker hele kroppen gjennom sonekartet.',
  },
  {
    title: 'Øreakupunktur',
    slug: 'oreakupunktur',
    description: 'Stimulering av akupunkturpunkter i øret for balanse og velvære.',
  },
  {
    title: 'Tankefeltterapi',
    slug: 'tankefeltterapi',
    description:
      serviceFallbacks.tankefeltterapi.shortDescription,
  },
] as const

export function mapServiceNavItems(services: ServiceListItem[]) {
  return mapServiceCards(services).map(({ title, slug }) => ({ title, slug }))
}

export function mapServiceCards(services: ServiceListItem[]) {
  if (services.length > 0) {
    return services.map((service) => ({
      key: service._id,
      title: service.title,
      slug: service.slug.current,
      description: resolveServiceShortDescription(
        service.slug.current,
        service.shortDescription
      ),
      image: service.image,
    }))
  }

  return defaultServiceCards.map((service) => ({
    key: service.slug,
    title: service.title,
    slug: service.slug,
    description: service.description,
    image: undefined,
  }))
}
