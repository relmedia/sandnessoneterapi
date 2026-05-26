import { defineField, defineType } from 'sanity'

export const courseRegistration = defineType({
  name: 'courseRegistration',
  title: 'Kurspåmeldinger',
  type: 'document',
  fields: [
    defineField({
      name: 'course',
      title: 'Kurs',
      type: 'reference',
      to: [{ type: 'course' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'courseTitle',
      title: 'Kursnavn',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'sessionKey',
      title: 'Sesjon-ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'sessionDate',
      title: 'Startdato',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sessionEndDate',
      title: 'Sluttdato',
      type: 'date',
    }),
    defineField({
      name: 'sessionStartTime',
      title: 'Starttid',
      type: 'string',
    }),
    defineField({
      name: 'sessionEndTime',
      title: 'Sluttid',
      type: 'string',
    }),
    defineField({
      name: 'name',
      title: 'Fornavn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Etternavn',
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
          { title: 'Venter betaling', value: 'pending_payment' },
          { title: 'Bekreftet', value: 'confirmed' },
          { title: 'Venteliste', value: 'waitlist' },
          { title: 'Avlyst', value: 'cancelled' },
          { title: 'Refundert', value: 'refunded' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending_payment',
    }),
    defineField({
      name: 'waitlistPosition',
      title: 'Plass på venteliste',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'amountPaid',
      title: 'Betalt beløp (kr)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'vippsPaymentReference',
      title: 'Vipps betalingsreferanse',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'vippsPspReference',
      title: 'Vipps PSP-referanse',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'cancelToken',
      title: 'Avbestillingskode',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Opprettet',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'paidAt',
      title: 'Betalt',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'confirmedAt',
      title: 'Bekreftet',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'cancelledAt',
      title: 'Avlyst',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'reminderSent7dAt',
      title: 'Påminnelse 7 dager sendt',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'reminderSent1dAt',
      title: 'Påminnelse 1 dag sendt',
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
      name: 'name',
      lastName: 'lastName',
      courseTitle: 'courseTitle',
      sessionDate: 'sessionDate',
      status: 'status',
    },
    prepare({ name, lastName, courseTitle, sessionDate, status }) {
      const fullName = [name, lastName].filter(Boolean).join(' ')
      return {
        title: fullName || 'Ukjent',
        subtitle: [courseTitle, sessionDate, status].filter(Boolean).join(' · '),
      }
    },
  },
})
