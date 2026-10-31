import { Link, useLocation } from 'react-router-dom'
import Logo from './brand/Logo'
import ThemeToggle from './ThemeToggle'

/** The mark and wordmark, top-left, on every page but Home (whose own heading is the brand). */
export default function SiteHeader() {
  const onHome = useLocation().pathname === '/'

  return (
    <header className="flex items-center justify-between py-5">
      {onHome ? (
        <span />
      ) : (
        <Link to="/" className="flex items-center gap-2 font-serif text-2xl italic text-ink transition hover:opacity-80">
          <Logo decorative className="h-7 w-7" />
          Iris
        </Link>
      )}
      <ThemeToggle />
    </header>
  )
}
