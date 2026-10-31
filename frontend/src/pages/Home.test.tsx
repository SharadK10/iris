import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Home from './Home'

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home', () => {
  it('keeps every existing piece of copy and control', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'Iris' })).toBeInTheDocument()
    expect(screen.getByText('Listen, together.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create an Echo' })).toBeInTheDocument()
    expect(screen.getByText('Have a code?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join an Echo' })).toBeInTheDocument()
    expect(screen.getByText('Not here to listen together?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Write a letter' })).toBeInTheDocument()
    expect(screen.getByText('A bouquet of songs, sealed and sent to someone.')).toBeInTheDocument()
    expect(screen.getByText('Different souls, same soundtrack.')).toBeInTheDocument()
  })

  it('shows the Iris mark above the heading', () => {
    renderHome()
    expect(screen.getByRole('img', { name: 'Iris' })).toBeInTheDocument()
  })

  it('makes Create an Echo the primary action', () => {
    renderHome()
    expect(screen.getByRole('button', { name: 'Create an Echo' })).toHaveClass('btn-primary')
  })

  it('keeps the heading clear of illustrated flowers, with only the mark above it', () => {
    const { container } = renderHome()
    const hero = screen.getByRole('heading', { name: 'Iris' }).parentElement!
    expect(hero.querySelectorAll('svg')).toHaveLength(1)
    expect(hero.querySelector('svg')).toHaveAttribute('aria-label', 'Iris')
    expect(container.querySelector('[data-lean]')).toBeNull()
  })
})
