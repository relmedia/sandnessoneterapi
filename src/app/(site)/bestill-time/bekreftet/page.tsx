import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { BookingConfetti } from '@/components/BookingConfetti'
import { isValidCancelToken } from '@/lib/booking'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export const metadata = {
  title: 'Timeforespørsel mottatt',
  description: 'Takk for timebestillingen hos Sandnes Soneterapi.',
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token || !isValidCancelToken(token)) {
    notFound()
  }

  return (
    <div className="py-16 md:py-24">
      <BookingConfetti />
      <div className="container-wide section-padding mx-auto">
        <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-sage/20 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage-light">
            <CheckCircle2 className="h-7 w-7 text-sage-dark" aria-hidden />
          </div>
          <h1 className="mb-3 font-serif text-3xl text-stone">Takk for bestillingen!</h1>
          <p className="mb-8 font-sans text-sm font-light leading-relaxed text-muted">
            Timeforespørselen er mottatt. Du får en bekreftelse på e-post med detaljer og
            avbestillingskode. Terje tar kontakt for å bekrefte dato og tid.
          </p>

          <div className="mb-8 rounded-xl border border-stone/10 bg-cream/60 p-5 text-left">
            <p className="mb-2 font-sans text-xs uppercase tracking-widest text-sage">Avbestilling</p>
            <p className="mb-4 font-sans text-sm font-light text-muted">
              Lagre denne lenken om du må avbestille senere:
            </p>
            <Link
              href={`/avbestill?token=${encodeURIComponent(token)}`}
              className="inline-block break-all font-sans text-sm text-sage-dark underline underline-offset-2"
            >
              Avbestill timen
            </Link>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/bestill-time"
              className="inline-flex rounded-full bg-stone px-6 py-3 font-sans text-sm font-light tracking-wide text-cream transition-colors hover:bg-sage-dark"
            >
              Bestill ny time
            </Link>
            <Link
              href="/avbestill"
              className="font-sans text-sm font-light text-muted transition-colors hover:text-sage-dark"
            >
              Avbestill uten lenke
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
