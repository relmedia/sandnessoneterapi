import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Nettstedinnstillinger',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Sidetittel',
      type: 'string',
      initialValue: 'Sandnes Soneterapi',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Slagord',
      type: 'string',
      initialValue: '40 års erfaring – Terje Horpestad, godkjent soneterapeut',
    }),
    defineField({
      name: 'heroHeading',
      title: 'Velkomsttekst (stor overskrift)',
      type: 'string',
    }),
    defineField({
      name: 'heroBody',
      title: 'Velkomsttekst (ingress)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Profilbilde (forside)',
      description:
        'Portrettbilde som vises i velkomstseksjonen på forsiden. Last opp et stående bilde (ca. 2:3).',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt-tekst',
          description: 'Kort beskrivelse av bildet for synshemmede og søkemotorer.',
          initialValue: 'Terje Horpestad, soneterapeut',
          validation: (Rule) =>
            Rule.required().warning('Legg inn alt-tekst når du laster opp bilde'),
        },
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
      initialValue: '45036557',
      validation: (Rule) =>
        Rule.regex(/^\d{8}$/, { name: 'phone', invert: false }).warning(
          'Telefon bør være 8 siffer uten mellomrom'
        ),
    }),
    defineField({
      name: 'email',
      title: 'E-post',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'address',
      title: 'Adresse',
      type: 'string',
      initialValue: 'Industrigata 1, 4307 Sandnes',
    }),
    defineField({
      name: 'nnh',
      title: 'NNH-godkjent',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook-lenke',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta-beskrivelse (SEO)',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(160).warning('Ideelt under 160 tegn for SEO'),
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
