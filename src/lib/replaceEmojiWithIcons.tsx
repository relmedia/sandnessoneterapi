import { Mail, MapPin, Phone } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'

const emojiIconMap = {
  '📞': Phone,
  '✉️': Mail,
  '📍': MapPin,
} as const

type EmojiKey = keyof typeof emojiIconMap

function renderTextWithIcons(text: string): ReactNode[] {
  const pattern = /(📞|✉️|📍)/g
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    if (part in emojiIconMap) {
      const Icon = emojiIconMap[part as EmojiKey]
      return (
        <Icon
          key={`icon-${index}`}
          className="inline size-4 align-text-bottom mr-1"
          aria-hidden="true"
        />
      )
    }
    return part
  })
}

export function replaceEmojiWithIcons(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    if (!/(📞|✉️|📍)/.test(node)) return node
    return renderTextWithIcons(node)
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={index}>{replaceEmojiWithIcons(child)}</Fragment>
    ))
  }

  return node
}
