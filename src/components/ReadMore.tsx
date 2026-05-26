'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

type ReadMoreProps = {
  children: ReactNode
  maxHeight?: number
  className?: string
}

export function ReadMore({ children, maxHeight = 220, className }: ReadMoreProps) {
  const contentId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    const checkOverflow = () => {
      setIsTruncated(element.scrollHeight > maxHeight + 1)
    }

    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(element)

    return () => observer.disconnect()
  }, [maxHeight])

  return (
    <div className={className}>
      <div className="relative">
        <div
          id={contentId}
          ref={contentRef}
          className={!expanded && isTruncated ? 'overflow-hidden' : undefined}
          style={!expanded && isTruncated ? { maxHeight } : undefined}
        >
          {children}
        </div>
        {!expanded && isTruncated && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-cream to-transparent"
          />
        )}
      </div>
      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="mt-3 cursor-pointer font-sans text-sm font-light text-sage-dark transition-colors hover:text-stone"
        >
          {expanded ? 'Vis mindre' : 'Les mer'}
        </button>
      )}
    </div>
  )
}
