import { defineField, defineType } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Sider',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Sidetittel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Sideinnhold',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt-tekst' },
            { name: 'caption', type: 'string', title: 'Bildetekst' },
          ],
        },
      ],
    }),
    defineField({
      name: 'priceList',
      title: 'Prisliste',
      description: 'Brukes på priser-siden (/priser). Legg til behandlinger og priser her.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'priceItem',
          title: 'Pris',
          fields: [
            defineField({
              name: 'label',
              title: 'Behandling / tjeneste',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Pris',
              type: 'string',
              description: 'F.eks. «660 kr» eller «Kontakt for pris»',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'price' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
