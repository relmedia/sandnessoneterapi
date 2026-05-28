import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { confirmBookOrderPayment } from '@/lib/book-order-service'
import { client } from '@/lib/sanity'

interface PageProps {
  searchParams: Promise<{ reference?: string }>
}

export default async function BookOrderSuccessPage({ searchParams }: PageProps) {
  const { reference } = await searchParams

  let confirmed = false
  let bookTitle: string | null = null

  if (reference) {
    confirmed = await confirmBookOrderPayment(reference)

    const order = await client.fetch<{ bookTitle?: string } | null>(
      `*[_type == "bookOrder" && vippsPaymentReference == $reference][0]{ bookTitle }`,
      { reference }
    )

    bookTitle = order?.bookTitle ?? null
  }

  return (
    <article className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto max-w-2xl">
        <div className="rounded-2xl border border-stone/10 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-6 flex items-center gap-3 text-sage-dark">
            <CheckCircle2 className="size-8 shrink-0" aria-hidden />
            <h1 className="font-serif text-3xl text-stone">
              {confirmed ? 'Bestilling bekreftet' : 'Takk for bestillingen'}
            </h1>
          </div>

          <p className="font-sans text-base font-light leading-relaxed text-muted">
            {confirmed
              ? `Betalingen${bookTitle ? ` for ${bookTitle}` : ''} er mottatt via Vipps. Du får bekreftelse på e-post, og vi sender boken til adressen du oppga.`
              : `Vi behandler Vipps-betalingen${bookTitle ? ` for ${bookTitle}` : ''}. Du får bekreftelse på e-post så snart betalingen er registrert.`}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/boker"
              className="inline-flex rounded-full bg-stone px-6 py-3 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              Tilbake til bøker
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-stone/20 px-6 py-3 font-sans text-sm font-light tracking-wide text-stone transition-colors hover:border-sage hover:text-sage-dark"
            >
              Til forsiden
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
