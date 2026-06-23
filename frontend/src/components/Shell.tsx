import type { ReactNode } from 'react'
import Sunflower from './botanical/Sunflower'
import Iris from './botanical/Iris'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ground px-3 py-6 sm:px-4 sm:py-14">
      <div className="relative mx-auto w-full max-w-canvas overflow-hidden rounded-canvas border border-line bg-paper shadow-paper">
        <Sunflower className="pointer-events-none absolute -bottom-5 -left-7 z-0 w-28 sm:w-44" />
        <Iris className="pointer-events-none absolute -bottom-3 -right-8 z-0 w-24 sm:w-40" />
        <div className="relative z-10 px-5 py-12 sm:px-20 sm:py-24">{children}</div>
        <footer className="relative z-10 flex items-center justify-center gap-2 border-t border-line px-5 py-5 text-xs text-muted">
          <span>powered by</span>
          <img src="/liv2code_logo.png" alt="liv2code" className="h-5 w-auto" />
        </footer>
      </div>
    </div>
  )
}
