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
      name: 'innhold',
      title: 'Innhold',
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
            S.documentTypeListItem('service').title('Behandlinger'),
            S.documentTypeListItem('article').title('Artikler'),
            S.documentTypeListItem('page').title('Sider'),
            S.documentTypeListItem('course').title('Kurs'),
            S.documentTypeListItem('book').title('Bøker'),
            S.divider(),
            S.documentTypeListItem('bookingRequest').title('Timebestillinger'),
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
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (input, context) => {
      if (context.schemaType === 'bookingRequest') {
        return input.filter(({ action }) => action !== 'duplicate')
      }

      if (singletonTypes.has(context.schemaType)) {
        return input.filter(({ action }) => action !== 'delete' && action !== 'duplicate')
      }

      return input
    },
  },
})
