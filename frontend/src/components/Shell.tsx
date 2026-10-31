import type { ReactNode } from 'react'
import Canvas from './Canvas'
import SiteHeader from './SiteHeader'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ground text-ink">
      <Canvas />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-canvas flex-col px-5 sm:px-8">
        <SiteHeader />
        <main className="flex-1 pb-16 pt-4 sm:pb-24 sm:pt-8">{children}</main>
        <footer className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
          <span>powered by</span>
          <img src="/liv2code_logo.png" alt="liv2code" className="footer-logo h-5 w-auto" />
        </footer>
      </div>
    </div>
  )
}
