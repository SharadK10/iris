import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { THEME_KEY, applyChoice, readChoice, resolveTheme, writeChoice } from './theme'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('readChoice', () => {
  it('is system when nothing is stored', () => {
    expect(readChoice()).toBe('system')
  })

  it('is system for an unknown value', () => {
    localStorage.setItem(THEME_KEY, 'blue')
    expect(readChoice()).toBe('system')
  })

  it('is system when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readChoice()).toBe('system')
  })

  it('returns a stored choice', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    expect(readChoice()).toBe('dark')
  })
})

describe('writeChoice', () => {
  it('stores light or dark', () => {
    writeChoice('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
  })

  it('removes the key for system', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    writeChoice('system')
    expect(localStorage.getItem(THEME_KEY)).toBeNull()
  })

  it('does not throw when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full')
    })
    expect(() => writeChoice('light')).not.toThrow()
  })
})

describe('resolveTheme', () => {
  it('follows the system for system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('an explicit choice beats the system', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('applyChoice', () => {
  it('sets data-theme for an explicit choice', () => {
    applyChoice('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('removes data-theme for system', () => {
    document.documentElement.dataset.theme = 'light'
    applyChoice('system')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })
})

describe('browser chrome colour', () => {
  function addMetas() {
    document.head.innerHTML = `
      <meta name="theme-color" content="#f8f3e8" media="(prefers-color-scheme: light)">
      <meta name="theme-color" content="#121019" media="(prefers-color-scheme: dark)">`
    return [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
  }

  it('follows an explicit choice regardless of the system', () => {
    const metas = addMetas()
    applyChoice('dark')
    expect(metas.map((m) => m.content)).toEqual(['#121019', '#121019'])
    applyChoice('light')
    expect(metas.map((m) => m.content)).toEqual(['#f8f3e8', '#f8f3e8'])
  })

  it('goes back to following the system for system', () => {
    const metas = addMetas()
    applyChoice('dark')
    applyChoice('system')
    expect(metas.map((m) => m.content)).toEqual(['#f8f3e8', '#121019'])
  })
})

describe('pre-paint script', () => {
  it('index.html applies the saved choice, and the chrome colour, before first paint', () => {
    const html = readFileSync(join(__dirname, '..', '..', 'index.html'), 'utf8')
    const head = html.slice(0, html.indexOf('</head>'))
    const script = head.slice(head.indexOf('<script>'), head.indexOf('</script>'))
    expect(head.indexOf('<script>')).toBeLessThan(head.indexOf('stylesheet'))
    expect(script).toContain(`localStorage.getItem('${THEME_KEY}')`)
    expect(script).toContain('dataset.theme')
    expect(script).toContain('theme-color')
  })
})
