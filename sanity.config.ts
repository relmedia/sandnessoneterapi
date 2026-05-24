import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { resolve } from './sanity/presentation/resolve'

const singletonTypes = new Set(['siteSettings'])

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

  plugins: [
    structureTool({
      structure: (S) =>
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
            S.listItem()
              .title('Behandlinger')
              .schemaType('service')
              .child(S.documentTypeList('service').title('Behandlinger')),
            S.listItem()
              .title('Kurs')
              .schemaType('course')
              .child(S.documentTypeList('course').title('Kurs')),
            S.listItem()
              .title('Bøker')
              .schemaType('book')
              .child(S.documentTypeList('book').title('Bøker')),
            S.listItem()
              .title('Artikler')
              .schemaType('article')
              .child(S.documentTypeList('article').title('Artikler')),
            S.listItem()
              .title('Timebestillinger')
              .schemaType('bookingRequest')
              .child(S.documentTypeList('bookingRequest').title('Timebestillinger')),
            S.divider(),
            S.listItem()
              .title('Sider')
              .schemaType('page')
              .child(S.documentTypeList('page').title('Sider')),
          ]),
    }),
    presentationTool({
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
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action !== 'delete' && action !== 'duplicate')
        : input,
  },
})
