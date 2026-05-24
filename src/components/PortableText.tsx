import Image from 'next/image'
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlockComponent,
} from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { urlFor } from '@/lib/sanity'
import { isSafeExternalUrl } from '@/lib/utils'
import type { SanityImage } from '@/lib/types'

const blockComponents: Record<string, PortableTextBlockComponent> = {
  h2: ({ children }) => (
    <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-xl md:text-2xl font-normal text-stone mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-serif text-lg font-normal text-stone mt-6 mb-2">{children}</h4>
  ),
  normal: ({ children }) => (
    <p className="font-sans font-light text-base md:text-lg text-muted leading-relaxed mb-5">
      {children}
    </p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-sage pl-6 my-8 italic font-serif text-xl text-stone/80">
      {children}
    </blockquote>
  ),
}

const components: PortableTextComponents = {
  block: blockComponents,
  marks: {
    link: ({ children, value }) => {
      const href = value?.href
      if (!href || !isSafeExternalUrl(href)) {
        return <span>{children}</span>
      }
      const isExternal = !href.startsWith('/')
      return (
        <a
          href={href}
          className="text-sage-dark underline underline-offset-2 hover:text-sage transition-colors"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
    strong: ({ children }) => <strong className="font-medium text-stone">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
  types: {
    image: ({ value }: { value: SanityImage & { caption?: string } }) => {
      if (!value?.asset) return null
      const src = urlFor(value).width(900).url()
      return (
        <figure className="my-10">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
            <Image
              src={src}
              alt={value.alt ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-muted mt-3 font-sans font-light italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 text-muted mb-5 font-sans font-light">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 text-muted mb-5 font-sans font-light">
        {children}
      </ol>
    ),
  },
}

interface PortableTextRendererProps {
  value: PortableTextBlock[] | undefined
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  if (!value?.length) return null
  return (
    <div className="prose-sanity">
      <PortableText value={value} components={components} />
    </div>
  )
}
