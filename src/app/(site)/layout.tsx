import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SiteClientExtras } from '@/components/SiteClientExtras'
import { DisableDraftMode } from '@/components/DisableDraftMode'
import { getServices, getSiteSettings, getSanityQueryOptions, publishedQuery } from '@/lib/sanity'
import { SanityLive } from '@/lib/sanity-live'
import { mapServiceNavItems } from '@/lib/service-fallbacks'
import '../globals.css'

const defaultDescription =
  'Soneterapeut Terje Horpestad – 40 års erfaring. Soneterapi, øreakupunktur og tankefeltterapi i Sandnes.'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings(publishedQuery)
  const title = settings?.title ?? 'Sandnes Soneterapi'
  const description = settings?.metaDescription ?? defaultDescription

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sandnessoneterapi.no'),
    openGraph: {
      title,
      description,
      locale: 'nb_NO',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled: isDraftMode } = await draftMode()
  const sanityOptions = getSanityQueryOptions(isDraftMode)
  const [settings, services] = await Promise.all([
    getSiteSettings(sanityOptions),
    getServices(sanityOptions),
  ])
  const serviceNavItems = mapServiceNavItems(services)

  return (
    <>
      <Header settings={settings} services={serviceNavItems} />
      <main>{children}</main>
      <Footer settings={settings} />
      <SiteClientExtras />
      {/* Always mounted so published edits propagate live to all visitors. */}
      <SanityLive includeDrafts={isDraftMode} />
      {isDraftMode && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  )
}
