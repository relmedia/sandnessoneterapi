# Sandnes Soneterapi — CMS & Nettsted

Next.js 16 + Sanity v5.26.0 + Tailwind CSS — hostet gratis på Vercel.

## Stack

| Del | Teknologi |
|-----|-----------|
| Frontend | Next.js 16 (App Router) |
| CMS | Sanity v5.26.0 (Studio innebygd i prosjektet) |
| Styling | Tailwind CSS |
| Hosting | Vercel (gratis tier) |
| Bilder | Sanity CDN |

## Kom i gang

```bash
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
npm run sanity       # http://localhost:3333
```

Fyll ut `NEXT_PUBLIC_SANITY_PROJECT_ID` og `SANITY_STUDIO_PROJECT_ID` i `.env.local`.

Legg til CORS origins i [sanity.io/manage](https://www.sanity.io/manage):
- `http://localhost:3000`
- `http://localhost:3333`
- Din Vercel-URL etter deploy

## Deploy

```bash
npm run sanity:deploy   # Sanity Studio (valgfritt)
vercel                  # Next.js frontend
```

Sett miljøvariabler i Vercel-dashboardet. For øyeblikkelig cache-invalidering, sett opp webhook mot `/api/revalidate?secret=...` (se `.env.local.example`).
