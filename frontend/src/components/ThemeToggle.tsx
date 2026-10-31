import { useTheme } from '../theme/useTheme'
import { MoonIcon, SunIcon } from './icons'

export default function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-iris-soft hover:text-ink"
    >
      {next === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
    </button>
  )
}
