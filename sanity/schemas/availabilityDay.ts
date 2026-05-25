import { defineField, defineType } from 'sanity'

const TIME_SLOT_OPTIONS = [
  { title: '09:00', value: '09:00' },
  { title: '10:00', value: '10:00' },
  { title: '11:00', value: '11:00' },
  { title: '12:00', value: '12:00' },
  { title: '13:00', value: '13:00' },
  { title: '14:00', value: '14:00' },
  { title: '15:00', value: '15:00' },
  { title: '16:00', value: '16:00' },
]

export const availabilityDay = defineType({
  name: 'availabilityDay',
  title: 'Ledige dager',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Dato',
      type: 'date',
      validation: (Rule) =>
        Rule.required().custom(async (date, context) => {
          if (!date || typeof date !== 'string') return true

          const documentId = context.document?._id?.replace(/^drafts\./, '') ?? ''
          const client = context.getClient({ apiVersion: '2026-02-01' })
          const duplicate = await client.fetch<number>(
            `count(*[
              _type == "availabilityDay" &&
              date == $date &&
              !(_id in [$publishedId, $draftId])
            ])`,
            {
              date,
              publishedId: documentId,
              draftId: documentId ? `drafts.${documentId}` : '',
            }
          )

          return duplicate === 0 || 'Det finnes allerede en ledig dag for denne datoen.'
        }),
    }),
    defineField({
      name: 'isClosed',
      title: 'Stengt for booking',
      type: 'boolean',
      description: 'Skru på for å skjule dagen i kalenderen uten å slette den.',
      initialValue: false,
    }),
    defineField({
      name: 'slots',
      title: 'Ledige klokkeslett',
      type: 'array',
      of: [
        {
          type: 'string',
          options: { list: TIME_SLOT_OPTIONS },
        },
      ],
      hidden: ({ parent }) => parent?.isClosed === true,
      validation: (Rule) =>
        Rule.custom((slots, context) => {
          const parent = context.parent as { isClosed?: boolean } | undefined
          if (parent?.isClosed) return true
          if (!Array.isArray(slots) || slots.length === 0) {
            return 'Legg til minst ett klokkeslett, eller merk dagen som stengt.'
          }
          return true
        }),
    }),
  ],
  orderings: [
    {
      title: 'Dato (stigende)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
    {
      title: 'Dato (synkende)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      date: 'date',
      isClosed: 'isClosed',
      slots: 'slots',
    },
    prepare({ date, isClosed, slots }) {
      const count = Array.isArray(slots) ? slots.length : 0
      return {
        title: date ?? 'Uten dato',
        subtitle: isClosed ? 'Stengt' : `${count} ledige tider`,
      }
    },
  },
})
