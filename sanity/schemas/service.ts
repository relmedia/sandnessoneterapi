import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Behandlinger',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Behandlingsnavn',
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
      name: 'shortDescription',
      title: 'Kort beskrivelse (vises på forsiden)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Hovedbilde',
      description:
        'Vises øverst på behandlingssiden og i kort på forsiden. Last opp et liggende bilde (ca. 16:9) – du kan justere utsnitt med hotspot.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt-tekst',
          description: 'Kort beskrivelse av bildet for synshemmede og søkemotorer.',
          validation: (Rule) =>
            Rule.required().warning('Legg inn alt-tekst når du laster opp bilde'),
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Full beskrivelse',
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
    select: { title: 'title', media: 'image' },
  },
})
