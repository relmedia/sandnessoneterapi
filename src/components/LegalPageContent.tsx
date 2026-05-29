import type { ReactNode } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { PortableTextRenderer } from '@/components/PortableText'
import { hasPortableTextContent } from '@/lib/portable-text'

type LegalPageContentProps = {
  body?: PortableTextBlock[]
  fallback: ReactNode
}

export function LegalPageContent({ body, fallback }: LegalPageContentProps) {
  if (hasPortableTextContent(body)) {
    return <PortableTextRenderer value={body!} />
  }

  return <div className="prose-sanity">{fallback}</div>
}
