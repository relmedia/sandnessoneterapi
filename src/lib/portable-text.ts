import type { PortableTextBlock } from '@portabletext/types'

export function hasPortableTextContent(body?: PortableTextBlock[]): boolean {
  if (!body?.length) return false

  return body.some((block) => {
    if (block._type !== 'block' || !('children' in block) || !Array.isArray(block.children)) {
      return true
    }

    return block.children.some(
      (child) =>
        typeof child === 'object' &&
        child !== null &&
        'text' in child &&
        Boolean(String(child.text).trim()),
    )
  })
}
