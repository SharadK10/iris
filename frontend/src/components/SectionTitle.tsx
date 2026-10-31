import type { ReactNode } from 'react'
import IrisHead from './botanical/IrisHead'
import Sprig from './botanical/Sprig'

/** Section headings carry a sprig; "In Bloom" is a small gold kicker marked with the iris. */
export default function SectionTitle({
  children,
  variant = 'sprig',
}: {
  children: ReactNode
  variant?: 'sprig' | 'bloom'
}) {
  if (variant === 'bloom') {
    return (
      <h2 className="kicker w-full justify-center">
        <IrisHead className="h-4 w-4" />
        {children}
      </h2>
    )
  }

  return (
    <h2 className="flex items-center justify-center gap-2 font-serif text-2xl text-ink">
      <Sprig className="h-3 w-8" />
      {children}
    </h2>
  )
}
