import { useEffect, useState } from 'react'
import { applyChoice, readChoice, resolveTheme, writeChoice, type ResolvedTheme, type ThemeChoice } from './theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function useTheme(): { resolved: ResolvedTheme; toggle: () => void } {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice)
  const [prefersDark, setPrefersDark] = useState(() => matchMedia(DARK_QUERY).matches)

  // Keep following the system while the visitor hasn't picked a side.
  useEffect(() => {
    const media = matchMedia(DARK_QUERY)
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved = resolveTheme(choice, prefersDark)

  function toggle() {
    const next: ThemeChoice = resolved === 'dark' ? 'light' : 'dark'
    writeChoice(next)
    applyChoice(next)
    setChoice(next)
  }

  return { resolved, toggle }
}
