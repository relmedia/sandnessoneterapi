import { defineField, defineType } from 'sanity'

export const bookOrder = defineType({
  name: 'bookOrder',
  title: 'Bokbestillinger',
  type: 'document',
  fields: [
    defineField({
      name: 'book',
      title: 'Bok',
      type: 'reference',
      to: [{ type: 'book' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bookTitle',
      title: 'Boktittel',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'bookPrice',
      title: 'Bokpris (kr)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'shippingFee',
      title: 'Frakt (kr)',
      type: 'number',
      readOnly: true,
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
      name: 'addressLine1',
      title: 'Adresse',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'postalCode',
      title: 'Postnummer',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'Poststed',
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
          { title: 'Betalt', value: 'paid' },
          { title: 'Avbrutt', value: 'cancelled' },
          { title: 'Refundert', value: 'refunded' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending_payment',
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
      name: 'cancelledAt',
      title: 'Avbrutt',
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
      bookTitle: 'bookTitle',
      status: 'status',
      createdAt: 'createdAt',
    },
    prepare({ name, lastName, bookTitle, status, createdAt }) {
      const fullName = [name, lastName].filter(Boolean).join(' ')
      return {
        title: fullName || 'Ukjent',
        subtitle: [bookTitle, status, createdAt?.slice(0, 10)].filter(Boolean).join(' · '),
      }
    },
  },
})
