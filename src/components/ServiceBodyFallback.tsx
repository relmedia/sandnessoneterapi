interface ServiceBodyFallbackProps {
  paragraphs: string[]
}

export function ServiceBodyFallback({ paragraphs }: ServiceBodyFallbackProps) {
  return (
    <div className="prose-sanity">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}
