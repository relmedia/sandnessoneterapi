import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Nettstedinnstillinger',
  type: 'document',
  groups: [
    { name: 'generelt', title: 'Generelt', default: true },
    { name: 'forside', title: 'Forside' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Sidetittel',
      type: 'string',
      group: 'generelt',
      initialValue: 'Sandnes Soneterapi',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Slagord',
      type: 'string',
      group: 'generelt',
      initialValue: '40 års erfaring – Terje Horpestad, godkjent soneterapeut',
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
      group: 'generelt',
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
      group: 'generelt',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'address',
      title: 'Adresse',
      type: 'string',
      group: 'generelt',
      initialValue: 'Industrigata 1, 4307 Sandnes',
    }),
    defineField({
      name: 'nnh',
      title: 'NNH-godkjent',
      type: 'boolean',
      group: 'generelt',
      initialValue: true,
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook-lenke',
      type: 'url',
      group: 'generelt',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta-beskrivelse (SEO)',
      type: 'text',
      group: 'generelt',
      rows: 2,
      validation: (Rule) => Rule.max(160).warning('Ideelt under 160 tegn for SEO'),
    }),

    // ─── Forside: Velkomstseksjon ──────────────────────────────────────────
    defineField({
      name: 'heroEyebrow',
      title: 'Velkomst: liten tekst over overskrift',
      type: 'string',
      group: 'forside',
      initialValue:
        'Godkjent av NNH – Norske Naturterapeuters Hovedorganisasjon',
    }),
    defineField({
      name: 'heroHeading',
      title: 'Velkomst: stor overskrift',
      type: 'string',
      group: 'forside',
      description: 'Bruk linjeskift for å dele overskriften over flere linjer.',
    }),
    defineField({
      name: 'heroBody',
      title: 'Velkomst: ingress',
      type: 'text',
      group: 'forside',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Profilbilde (forside)',
      description:
        'Portrettbilde som vises i velkomstseksjonen på forsiden. Last opp et stående bilde (ca. 2:3).',
      type: 'image',
      group: 'forside',
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

    // ─── Forside: Behandlinger ─────────────────────────────────────────────
    defineField({
      name: 'servicesLabel',
      title: 'Behandlinger: liten tekst',
      type: 'string',
      group: 'forside',
      initialValue: 'Behandlinger',
    }),
    defineField({
      name: 'servicesHeading',
      title: 'Behandlinger: overskrift',
      type: 'string',
      group: 'forside',
      initialValue: 'Hva kan jeg hjelpe deg med?',
    }),
    defineField({
      name: 'servicesBody',
      title: 'Behandlinger: ingress',
      type: 'text',
      group: 'forside',
      rows: 3,
      initialValue:
        'Skånsomme, erfaringsbaserte metoder tilpasset dine behov — enten du søker avspenning, balanse eller støtte i en utfordrende periode.',
    }),

    // ─── Forside: Om terapeuten ────────────────────────────────────────────
    defineField({
      name: 'aboutLabel',
      title: 'Om terapeuten: liten tekst',
      type: 'string',
      group: 'forside',
      initialValue: 'Om terapeuten',
    }),
    defineField({
      name: 'aboutHeading',
      title: 'Om terapeuten: overskrift',
      type: 'string',
      group: 'forside',
      initialValue: '40 år med daglig erfaring',
    }),
    defineField({
      name: 'aboutParagraphs',
      title: 'Om terapeuten: avsnitt',
      type: 'array',
      group: 'forside',
      of: [{ type: 'text', rows: 3 }],
      initialValue: [
        'Terje Horpestad har over 40 års daglig erfaring innen soneterapi og alternativ medisin. Han er godkjent av Norske Naturterapeuters Hovedorganisasjon (NNH) og har utdannet terapeuter gjennom Soneterapiskolen i over 20 år.',
        'Han har skrevet to bøker om soneterapi og et hefte om tankefeltterapi og meridianlære, og holder foredrag om soneterapi, helse og kroppen i bevegelse.',
      ],
    }),
    defineField({
      name: 'aboutLinkLabel',
      title: 'Om terapeuten: lenketekst',
      type: 'string',
      group: 'forside',
      initialValue: 'Mer om Terje',
    }),
    defineField({
      name: 'stats',
      title: 'Om terapeuten: nøkkeltall',
      type: 'array',
      group: 'forside',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Tall / kort tekst', type: 'string' },
            { name: 'description', title: 'Beskrivelse', type: 'string' },
          ],
          preview: {
            select: { title: 'label', subtitle: 'description' },
          },
        },
      ],
      initialValue: [
        { label: '40+', description: 'Års daglig erfaring' },
        { label: '20+', description: 'År som utdanner' },
        { label: 'NNH', description: 'Godkjent terapeut' },
      ],
    }),

    // ─── Forside: Kurs ─────────────────────────────────────────────────────
    defineField({
      name: 'coursesLabel',
      title: 'Kurs: liten tekst',
      type: 'string',
      group: 'forside',
      initialValue: 'Kommende kurs',
    }),
    defineField({
      name: 'coursesHeading',
      title: 'Kurs: overskrift',
      type: 'string',
      group: 'forside',
      initialValue: 'Kurs og utdanning',
    }),
    defineField({
      name: 'coursesLinkLabel',
      title: 'Kurs: lenketekst',
      type: 'string',
      group: 'forside',
      initialValue: 'Se alle kurs',
    }),

    // ─── Forside: Avslutning (oppfordring) ─────────────────────────────────
    defineField({
      name: 'ctaHeading',
      title: 'Avslutning: overskrift',
      type: 'string',
      group: 'forside',
      initialValue: 'Klar for en behandling?',
    }),
    defineField({
      name: 'ctaBody',
      title: 'Avslutning: tekst',
      type: 'text',
      group: 'forside',
      rows: 3,
      initialValue:
        'Bestill time online eller ring for å avtale. Velkommen til Industrigata 1 i Sandnes.',
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
