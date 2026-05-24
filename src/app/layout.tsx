import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getSiteSettings } from '@/lib/sanity'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

const defaultDescription =
  'Soneterapeut Terje Horpestad – 40 års erfaring. Soneterapi, øreakupunktur og tankefeltterapi i Sandnes.'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

  return (
    <html lang="nb" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <Header settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
