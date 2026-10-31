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
