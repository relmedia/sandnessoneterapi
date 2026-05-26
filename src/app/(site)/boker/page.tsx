import type { Metadata } from 'next'
import Image from 'next/image'
import { getBooks, getSiteSettings, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
import { ReadMore } from '@/components/ReadMore'
import { formatDateNb, getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Bøker',
  description: 'Bøker om soneterapi og tankefeltterapi av Terje Horpestad.',
}

export default async function BokerPage() {
  const [books, settings] = await Promise.all([getBooks(), getSiteSettings()])
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <div className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto">
        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          Litteratur
        </p>
        <h1 className="font-serif text-display text-stone mb-4">Bøker</h1>
        <p className="font-sans font-light text-xl text-muted mb-16 max-w-xl">
          Terje Horpestad har skrevet to bøker om soneterapi og ett hefte om tankefeltterapi. Kan
          bestilles ved å ringe {phoneDisplay}.
        </p>

        <div className="flex flex-col gap-16">
          {books.length > 0 ? (
            books.map((book) => (
              <article
                key={book._id}
                className="grid md:grid-cols-[280px_1fr] gap-10 items-start"
              >
                <div className="flex flex-col gap-4">
                  {book.coverImage ? (
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                      <Image
                        src={urlFor(book.coverImage).width(560).height(747).url()}
                        alt={book.coverImage.alt ?? book.title}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-sage-light/40">
                      <span className="text-5xl" aria-hidden="true">
                        📖
                      </span>
                    </div>
                  )}
                  <a
                    href={`tel:${phoneTel}`}
                    className="inline-block w-full rounded-full bg-sage px-6 py-3 text-center font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
                  >
                    Bestill på tlf {phoneDisplay}
                  </a>
                </div>
                <div>
                  <h2 className="mb-3 font-serif text-3xl text-stone md:text-4xl">{book.title}</h2>
                  <div className="mb-6 flex flex-wrap gap-4 font-sans text-xs font-light uppercase tracking-widest text-muted">
                    {book.isbn && <span>ISBN {book.isbn}</span>}
                    {book.publishedDate && (
                      <span>
                        Utgitt{' '}
                        {formatDateNb(book.publishedDate, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {book.pages && <span>{book.pages} sider</span>}
                    {book.price != null && (
                      <span className="text-sage-dark">{book.price} kr</span>
                    )}
                  </div>
                  {book.description && book.description.length > 0 && (
                    <ReadMore>
                      <PortableTextRenderer value={book.description} />
                    </ReadMore>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className="font-sans font-light text-muted">Bøker legges til snart.</p>
          )}
        </div>
      </div>
    </div>
  )
}
