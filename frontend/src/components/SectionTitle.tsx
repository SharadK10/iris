import type { ReactNode } from 'react'

export default function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-center font-serif text-2xl text-ink">{children}</h2>
}
