import type { Metadata } from 'next'
import Image from 'next/image'
import { getBooks, getSiteSettings, urlFor } from '@/lib/sanity'
import { PortableTextRenderer } from '@/components/PortableText'
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
            books.map((book, index) => (
              <article
                key={book._id}
                className={`grid md:grid-cols-[280px_1fr] gap-10 items-start ${index % 2 !== 0 ? 'md:grid-cols-[1fr_280px]' : ''}`}
              >
                {book.coverImage ? (
                  <div
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-sage-light ${index % 2 !== 0 ? 'md:order-2' : ''}`}
                  >
                    <Image
                      src={urlFor(book.coverImage).width(560).height(747).url()}
                      alt={book.coverImage.alt ?? book.title}
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                ) : (
                  <div
                    className={`aspect-[3/4] rounded-2xl bg-sage-light flex items-center justify-center ${index % 2 !== 0 ? 'md:order-2' : ''}`}
                  >
                    <span className="text-5xl" aria-hidden="true">
                      📖
                    </span>
                  </div>
                )}
                <div className={index % 2 !== 0 ? 'md:order-1' : ''}>
                  <h2 className="font-serif text-3xl md:text-4xl text-stone mb-3">{book.title}</h2>
                  <div className="flex flex-wrap gap-4 text-xs font-sans font-light text-muted uppercase tracking-widest mb-6">
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
                    {book.price != null && <span className="text-sage-dark">{book.price} kr</span>}
                  </div>
                  <PortableTextRenderer value={book.description} />
                  <a
                    href={`tel:${phoneTel}`}
                    className="mt-6 inline-block px-6 py-3 bg-sage text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide"
                  >
                    Bestill på tlf {phoneDisplay}
                  </a>
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
