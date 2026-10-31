export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_KEY = 'iris-theme'

// Browser chrome colours, matching --ground in each mode.
const CHROME = { light: '#f8f3e8', dark: '#121019' } as const

/** The visitor's saved choice; anything missing, unknown or unreadable means "follow the system". */
export function readChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function writeChoice(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, choice)
  } catch {
    // Storage can be blocked (private mode, site data off); the choice just won't persist.
  }
}

export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): ResolvedTheme {
  if (choice === 'system') return prefersDark ? 'dark' : 'light'
  return choice
}

/** An explicit choice pins `data-theme`; "system" clears it so the CSS media query decides. */
export function applyChoice(choice: ThemeChoice): void {
  const root = document.documentElement
  if (choice === 'system') delete root.dataset.theme
  else root.dataset.theme = choice

  // Each theme-color meta is scoped to a system scheme; an explicit choice pins both.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const scheme = meta.getAttribute('media')?.includes('dark') ? 'dark' : 'light'
    meta.content = CHROME[choice === 'system' ? scheme : choice]
  })
}
