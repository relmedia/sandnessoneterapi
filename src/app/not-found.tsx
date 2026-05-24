import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-24 md:py-36">
      <div className="container-narrow section-padding mx-auto text-center">
        <p className="font-sans font-light text-xs uppercase tracking-[0.3em] text-sage mb-4">
          404
        </p>
        <h1 className="font-serif text-display text-stone mb-6">Siden finnes ikke</h1>
        <p className="font-sans font-light text-muted mb-10">
          Beklager, vi fant ikke siden du leter etter.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-sage text-cream font-sans font-light text-sm rounded-full hover:bg-sage-dark transition-colors tracking-wide"
        >
          Tilbake til forsiden
        </Link>
      </div>
    </div>
  )
}
