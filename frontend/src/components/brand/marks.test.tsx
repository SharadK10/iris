import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Logo from './Logo'
import IrisHead from '../botanical/IrisHead'
import SunflowerHead from '../botanical/SunflowerHead'
import Leaf from '../botanical/Leaf'
import Sprig from '../botanical/Sprig'
import Vine from '../botanical/Vine'

describe('Logo', () => {
  it('is an image named Iris', () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'Iris' })).toBeInTheDocument()
  })

  it('can be hidden from assistive tech when a visible label sits beside it', () => {
    const { container } = render(<Logo decorative />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('botanical ornaments', () => {
  const ornaments = { IrisHead, SunflowerHead, Leaf, Sprig, Vine }
  for (const [name, Ornament] of Object.entries(ornaments)) {
    it(`${name} is decorative`, () => {
      const { container } = render(<Ornament />)
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
  }

  it('the iris stamp is a single dark-gold fill with no violet', () => {
    const { container } = render(<IrisHead variant="stamp" />)
    const html = container.innerHTML.toLowerCase()
    expect(html).not.toMatch(/#a79cff|#8b7bff|#b3a9ff|#6d5ef8|#5a4ecf/)
    expect(container.querySelector('svg')).toHaveAttribute('data-mark', 'iris-stamp')
  })

  it('the sunflower head is marked so brand marks can be checked for it', () => {
    const { container } = render(<SunflowerHead />)
    expect(container.querySelector('svg')).toHaveAttribute('data-mark', 'sunflower-head')
  })
})
