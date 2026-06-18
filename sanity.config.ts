'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { nbNOLocale } from '@sanity/locale-nb-no'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './sanity/schemas'
import { resolve } from './sanity/presentation/resolve'
import { draftModeCleanupPlugin } from './sanity/plugins/draftModeCleanup'
import { DeleteBookingAction } from './sanity/plugins/bookingRequestActions'

const singletonTypes = new Set(['siteSettings'])

type PtSpan = { text: string; marks?: string[] }

function ptBlock(
  key: string,
  text: string,
  style: 'normal' | 'h2' = 'normal'
) {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] as string[] }],
  }
}

function ptBullet(key: string, spans: PtSpan[]) {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: spans.map((span, index) => ({
      _type: 'span',
      _key: `${key}-s${index}`,
      text: span.text,
      marks: span.marks ?? [],
    })),
  }
}

// Startinnhold for «Om meg»-siden, slik at teksten kan redigeres i Studio.
const omMegBody = [
  ptBlock(
    'om-meg-1',
    'Terje Horpestad har gjennom 35 års daglig erfaring med soneterapibehandlinger utviklet et unikt og detaljert sonesystem som har resultert i 3 fagbøker i soneterapi og 1 stk fagbok i tankefeltterapi.'
  ),
  ptBlock(
    'om-meg-2',
    'I 1998 startet han Soneterapiskolen hvor han har vært lærer og rektor. Skolen har vært godkjent av Norske Naturterapeuters Hovedorganisasjon siden 1998.'
  ),
  ptBlock(
    'om-meg-3',
    'Terje er eksaminert soneterapeut v/Naturheilschule i 1986. Han har videreutdanning i fotsoneterapi v/Charles Ersdal. I tillegg til eksamener fra Naturheilschule i øreakupunktur, urtemedisin, anatomi og fysiologi. Eksamen i tankefeltterapi: Alternativet i Stavanger.'
  ),
  ptBlock(
    'om-meg-4',
    'Sandnes Soneterapi har bedriftsavtaler med flere større bedrifter i Rogaland (blandt annet Coop på Bryne). Terje har tidligere i flere år vært leder i forskningskomiteen til NNH.'
  ),
  ptBlock('om-meg-boker', 'Bøker utgitt av Terje', 'h2'),
  ptBullet('om-meg-bok-1', [
    { text: 'Ny kunnskap i Soneterapi', marks: ['em'] },
    { text: ' — ISBN 978-82-997412-2-4' },
  ]),
  ptBullet('om-meg-bok-2', [
    { text: 'New knowledge in reflexotherapy', marks: ['em'] },
    { text: ' — ISBN 978-82-997412-5-5' },
  ]),
  ptBullet('om-meg-bok-3', [
    { text: 'Tankefeltterapi, akupunktur og meridianlære', marks: ['em'] },
    { text: ' — ISBN 978-82-997412-4-8' },
  ]),
  ptBullet('om-meg-bok-4', [
    { text: 'Soneterapi i tekst og bilder', marks: ['em'] },
    { text: ' — ISBN 978-82-997412-8-6' },
  ]),
  ptBlock('om-meg-kurs', 'Kurser som Terje har undervist i', 'h2'),
  ptBullet('om-meg-kurs-1', [
    { text: 'Faglærer ved Sirius Naturterapeutiske skole i Haugesund' },
  ]),
  ptBullet('om-meg-kurs-2', [
    { text: 'Faglærer i soneterapi i Tromsø på Akademiet Helbred' },
  ]),
  ptBullet('om-meg-kurs-3', [
    { text: 'Fagkurs i soneterapi for terapeuter i Sandnes, Oslo og Tromsø' },
  ]),
  ptBullet('om-meg-kurs-4', [
    {
      text: 'Grunnkurs i soneterapi for elever som ønsker å lære soneterapi i lokalene til Sandnes Soneterapi',
    },
  ]),
]

export default defineConfig({
  name: 'default',
  title: 'Sandnes Soneterapi',

  basePath: '/studio',

  // Inlined at build time (browser-safe). Falls back to NEXT_PUBLIC_* for Vercel.
  projectId:
    process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:
    process.env.SANITY_STUDIO_DATASET ??
    process.env.NEXT_PUBLIC_SANITY_DATASET ??
    'production',

  i18n: {
    locales: (prev) => {
      const nbNO = prev.find((locale) => locale.id === 'nb-NO')
      return nbNO ? [nbNO] : prev
    },
  },

  plugins: [
    draftModeCleanupPlugin(),
    nbNOLocale(),
    structureTool({
      name: 'innhold',
      title: 'Innhold',
      structure: (S, context) =>
        S.list()
          .title('Innhold')
          .items([
            S.listItem()
              .title('Nettstedinnstillinger')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            S.documentTypeListItem('service').title('Behandlinger'),
            S.documentTypeListItem('article').title('Artikler'),
            S.listItem()
              .title('Priser')
              .id('priser')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('priser')
                  .title('Priser')
              ),
            S.listItem()
              .title('Foredrag')
              .id('foredrag')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('foredrag')
                  .title('Foredrag')
              ),
            S.listItem()
              .title('Salgsvilkår')
              .id('salgsvilkar')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('salgsvilkar')
                  .title('Salgsvilkår')
              ),
            S.listItem()
              .title('Personvern')
              .id('personvern')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('personvern')
                  .title('Personvern')
              ),
            S.listItem()
              .title('Om meg')
              .id('om-meg')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('om-meg')
                  .title('Om meg')
                  .initialValueTemplate('page-om-meg')
              ),
            S.documentTypeListItem('page').title('Andre sider'),
            orderableDocumentListDeskItem({ type: 'course', title: 'Kurs', S, context }),
            S.documentTypeListItem('book').title('Bøker'),
            S.divider(),
            S.documentTypeListItem('availabilityDay').title('Ledige dager'),
            S.listItem()
              .title('Timebestillinger')
              .schemaType('bookingRequest')
              .child(
                S.documentTypeList('bookingRequest')
                  .title('Timebestillinger')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('Kurspåmeldinger')
              .schemaType('courseRegistration')
              .child(
                S.documentTypeList('courseRegistration')
                  .title('Kurspåmeldinger')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),
          ]),
    }),
    presentationTool({
      name: 'forhandsvisning',
      title: 'Forhåndsvisning',
      resolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
      {
        id: 'page-priser',
        title: 'Priser-side',
        schemaType: 'page',
        value: {
          title: 'Priser',
          slug: { _type: 'slug', current: 'priser' },
          priceList: [
            { _type: 'priceItem', label: 'Soneterapi – 1 time', price: '660 kr' },
            { _type: 'priceItem', label: 'Øreakupunktur', price: 'Kontakt for pris' },
            { _type: 'priceItem', label: 'Tankefeltterapi', price: 'Kontakt for pris' },
          ],
        },
      },
      {
        id: 'page-foredrag',
        title: 'Foredrag-side',
        schemaType: 'page',
        value: {
          title: 'Foredrag',
          slug: { _type: 'slug', current: 'foredrag' },
        },
      },
      {
        id: 'page-salgsvilkar',
        title: 'Salgsvilkår-side',
        schemaType: 'page',
        value: {
          title: 'Salgsvilkår',
          slug: { _type: 'slug', current: 'salgsvilkar' },
        },
      },
      {
        id: 'page-personvern',
        title: 'Personvern-side',
        schemaType: 'page',
        value: {
          title: 'Personvern',
          slug: { _type: 'slug', current: 'personvern' },
        },
      },
      {
        id: 'page-om-meg',
        title: 'Om meg-side',
        schemaType: 'page',
        value: {
          title: 'Om meg',
          slug: { _type: 'slug', current: 'om-meg' },
          body: omMegBody,
        },
      },
    ],
  },

  document: {
    actions: (input, context) => {
      if (context.schemaType === 'bookingRequest') {
        return input
          .filter(({ action }) => action !== 'duplicate' && action !== 'delete')
          .concat(DeleteBookingAction)
      }

      if (singletonTypes.has(context.schemaType)) {
        return input.filter(({ action }) => action !== 'delete' && action !== 'duplicate')
      }

      return input
    },
  },
})
