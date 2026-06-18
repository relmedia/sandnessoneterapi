import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { draftMode } from 'next/headers'
import { getArticles, getSanityQueryOptions, urlFor } from '@/lib/sanity'
import { formatDateNb } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Artikler',
  description: 'Artikler om soneterapi, helse og velvære av Terje Horpestad.',
}

export default async function ArtiklerPage() {
  const { isEnabled: isDraftMode } = await draftMode()
  const articles = await getArticles(getSanityQueryOptions(isDraftMode))

  return (
    <div className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto">
        <p className="text-label mb-4">
          Fagstoff
        </p>
        <h1 className="text-heading-display mb-16">Artikler om soneterapi</h1>

        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article._id}
                href={`/artikler/${article.slug.current}`}
                className="group block"
              >
                {article.coverImage ? (
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-sage-light">
                    <Image
                      src={urlFor(article.coverImage).width(600).height(338).url()}
                      alt={article.coverImage.alt ?? article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] rounded-2xl bg-sage-light mb-5" />
                )}
                {article.publishedAt && (
                  <p className="font-sans text-xs text-sage uppercase tracking-widest mb-2">
                    {formatDateNb(article.publishedAt, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                <h2 className="text-heading-card mb-2 group-hover:text-sage-dark transition-colors">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-body-sm">
                    {article.excerpt}
                  </p>
                )}
                <span className="inline-block mt-3 text-xs uppercase tracking-widest text-sage font-sans">
                  Les artikkelen →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-lg">Artikler legges til snart.</p>
        )}
      </div>
    </div>
  )
}
