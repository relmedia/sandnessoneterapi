import { defineField, defineType, type StringRule } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

const timeValidation = (Rule: StringRule) =>
  Rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: 'time' }).warning(
    'Bruk formatet HH:MM, f.eks. 09:00'
  )

export const course = defineType({
  name: 'course',
  title: 'Kurs',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'course' }),
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
      name: 'sessions',
      title: 'Datoer og tidspunkter',
      description:
        'Legg til én eller flere datoer. For kurs over flere dager, fyll inn sluttdato på samme oppføring.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'courseSession',
          title: 'Dato',
          fields: [
            defineField({
              name: 'date',
              title: 'Startdato',
              type: 'date',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'endDate',
              title: 'Sluttdato',
              type: 'date',
              description: 'Valgfritt – kun hvis denne oppføringen går over flere dager.',
            }),
            defineField({
              name: 'startTime',
              title: 'Starttid',
              type: 'string',
              description: 'F.eks. 09:00',
              validation: timeValidation,
            }),
            defineField({
              name: 'endTime',
              title: 'Sluttid',
              type: 'string',
              description: 'F.eks. 16:00',
              validation: timeValidation,
            }),
            defineField({
              name: 'capacity',
              title: 'Maks antall deltakere',
              type: 'number',
              description: 'Antall plasser for denne kursdatoen. Tom = 12 plasser.',
              validation: (Rule) => Rule.min(1).max(100),
              initialValue: 12,
            }),
          ],
          preview: {
            select: {
              date: 'date',
              endDate: 'endDate',
              startTime: 'startTime',
              endTime: 'endTime',
            },
            prepare({ date, endDate, startTime, endTime }) {
              const dateLabel = endDate && endDate !== date ? `${date} – ${endDate}` : date
              const timeLabel =
                startTime && endTime
                  ? `${startTime}–${endTime}`
                  : startTime
                    ? `kl. ${startTime}`
                    : null

              return {
                title: dateLabel ?? 'Ny dato',
                subtitle: timeLabel ?? undefined,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).warning('Legg til minst én dato'),
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
      name: 'registrationOpen',
      title: 'Åpen for påmelding',
      type: 'boolean',
      description: 'Skru av for å skjule nettpåmelding på nettstedet. Husk å publisere endringen.',
      initialValue: true,
    }),
    defineField({
      name: 'shortDescription',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Hovedbilde',
      description:
        'Vises på kurssiden og i oversikten. Anbefalt kvadratisk (1024×1024) eller liggende bilde i god oppløsning.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt-tekst',
          validation: (Rule) =>
            Rule.required().warning('Legg inn alt-tekst når du laster opp bilde'),
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Full kursbeskrivelse',
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
      name: 'active',
      title: 'Vis på nettstedet',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sessions: 'sessions',
      media: 'coverImage',
    },
    prepare({ title, sessions, media }) {
      const count = sessions?.length ?? 0
      const first = sessions?.[0]
      const firstLabel = first?.date
        ? first.endDate && first.endDate !== first.date
          ? `${first.date} – ${first.endDate}`
          : first.date
        : null

      return {
        title,
        subtitle:
          count > 1 && firstLabel
            ? `${firstLabel} (+${count - 1} til)`
            : (firstLabel ?? 'Ingen dato satt'),
        media,
      }
    },
  },
})
