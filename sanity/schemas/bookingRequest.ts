import { defineField, defineType } from 'sanity'

export const bookingRequest = defineType({
  name: 'bookingRequest',
  title: 'Timebestillinger',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'E-post',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Behandling',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Dato',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'time',
      title: 'Klokkeslett',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Melding',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Venter', value: 'pending' },
          { title: 'Bekreftet', value: 'confirmed' },
          { title: 'Avlyst', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Mottatt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'cancelToken',
      title: 'Avbestillingskode',
      type: 'string',
      readOnly: true,
      description: 'Genereres automatisk. Brukes av kunden for å avbestille online.',
    }),
    defineField({
      name: 'cancelledAt',
      title: 'Avbestilt',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Nyeste først',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      date: 'date',
      time: 'time',
      status: 'status',
    },
    prepare({ title, date, time, status }) {
      return {
        title: title ?? 'Ukjent',
        subtitle: [date, time, status].filter(Boolean).join(' · '),
      }
    },
  },
})
