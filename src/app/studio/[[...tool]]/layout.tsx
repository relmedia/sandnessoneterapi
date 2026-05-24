export { metadata, viewport } from 'next-sanity/studio'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--card-bg-color, #fff)',
      }}
    >
      {children}
    </div>
  )
}
