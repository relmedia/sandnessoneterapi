import { defineField, defineType } from 'sanity'

export const book = defineType({
  name: 'book',
  title: 'Bøker',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Boktittel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Klikk «Generate» for å lage slug. Valgfritt, men anbefalt for nettbestilling.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Forsidefoto',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt-tekst' }],
    }),
    defineField({
      name: 'isbn',
      title: 'ISBN',
      type: 'string',
    }),
    defineField({
      name: 'publishedDate',
      title: 'Utgitt',
      type: 'date',
    }),
    defineField({
      name: 'price',
      title: 'Pris (kr)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'orderOnline',
      title: 'Kan bestilles online med Vipps',
      type: 'boolean',
      initialValue: false,
      description:
        'Må være påslått og publisert for at «Kjøp med Vipps» vises. Kunden betaler til Vippsnummer #572429 etter bestilling.',
    }),
    defineField({
      name: 'pages',
      title: 'Antall sider',
      type: 'number',
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Rekkefølge',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'coverImage' },
  },
})
