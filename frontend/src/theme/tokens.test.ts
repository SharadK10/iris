import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import tailwindConfig from '../../tailwind.config.js'

const root = join(__dirname, '..', '..')
const css = readFileSync(join(root, 'src/index.css'), 'utf8')

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`missing block ${selector}`)
  return css.slice(start, css.indexOf('}', start))
}

function vars(body: string): Record<string, [number, number, number]> {
  const out: Record<string, [number, number, number]> = {}
  for (const m of body.matchAll(/--([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])]
  }
  return out
}

function luminance([r, g, b]: [number, number, number]): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const light = vars(block(':root'))
const dark = vars(block(":root[data-theme='dark']"))

const pairs: [string, string][] = [
  ['ink', 'ground'],
  ['muted-text', 'ground'],
  ['muted-text', 'paper'],
  ['gold-text', 'ground'],
  ['gold-text', 'paper'],
  ['iris-text', 'ground'],
  ['on-iris', 'iris'],
]

describe('theme tokens', () => {
  for (const [mode, set] of [['light', light], ['dark', dark]] as const) {
    for (const [fg, bg] of pairs) {
      it(`${fg} on ${bg} passes AA in ${mode}`, () => {
        expect(set[fg], `--${fg} in ${mode}`).toBeDefined()
        expect(set[bg], `--${bg} in ${mode}`).toBeDefined()
        expect(contrast(set[fg], set[bg])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  it('system dark block declares the same variables as the explicit dark block', () => {
    const media = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'))
    const systemDark = vars(media.slice(0, media.indexOf('}')))
    expect(Object.keys(systemDark).sort()).toEqual(Object.keys(dark).sort())
    expect(systemDark).toEqual(dark)
  })

  it('maps tailwind colours through rgb channels so opacity modifiers work', () => {
    const colors = JSON.stringify(tailwindConfig.theme?.extend?.colors)
    expect(tailwindConfig.theme?.extend?.colors?.ground).toBe('rgb(var(--ground) / <alpha-value>)')
    expect(colors).not.toMatch(/"var\(--/)
  })

  it('never uses a bare var(--token) colour in components', () => {
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) walk(path)
        else if (path.endsWith('.tsx')) {
          const src = readFileSync(path, 'utf8')
          const bare = src.replace(/rgb\(var\(--[a-z-]+\)/g, '').match(/var\(--(?!sway|dx|dy|rot)[a-z-]+\)/g)
          if (bare) offenders.push(`${path}: ${bare.join(', ')}`)
        }
      }
    }
    walk(join(root, 'src'))
    expect(offenders).toEqual([])
  })
})
