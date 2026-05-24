import { defineField, defineType } from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Kurs',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Kursnavn',
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
      name: 'startDate',
      title: 'Startdato',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: 'Sluttdato',
      type: 'date',
    }),
    defineField({
      name: 'location',
      title: 'Sted',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Pris (kr)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Full kursbeskrivelse',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'active',
      title: 'Vis på nettstedet',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'startDate' },
  },
})
