import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getArticle, getArticles, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { formatDateNb } from '@/lib/utils'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((article) => ({ slug: article.slug.current }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Artikkel ikke funnet' }
  return {
    title: article.title,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  return (
    <article className="py-16 md:py-24">
      <div className="container-narrow section-padding mx-auto">
        <nav
          className="flex items-center gap-2 text-xs font-sans font-light text-muted mb-12 uppercase tracking-widest"
          aria-label="Brødsmulesti"
        >
          <Link href="/" className="hover:text-stone transition-colors">
            Forside
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/artikler" className="hover:text-stone transition-colors">
            Artikler
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone">{article.title}</span>
        </nav>

        {article.publishedAt && (
          <p className="font-sans text-xs text-sage uppercase tracking-widest mb-4">
            {formatDateNb(article.publishedAt, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        <h1 className="font-serif text-display text-stone mb-8">{article.title}</h1>

        {article.excerpt && (
          <p className="font-sans font-light text-xl text-muted leading-relaxed mb-12 border-l-4 border-sage pl-6">
            {article.excerpt}
          </p>
        )}

        {article.coverImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-14 bg-sage-light">
            <Image
              src={urlFor(article.coverImage).width(1200).height(675).url()}
              alt={article.coverImage.alt ?? article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <PortableTextRenderer value={article.body} />

        <div className="mt-16 pt-8 border-t border-warm-light">
          <Link
            href="/artikler"
            className="font-sans font-light text-sm text-muted hover:text-stone transition-colors"
          >
            ← Tilbake til artikler
          </Link>
        </div>
      </div>
    </article>
  )
}
