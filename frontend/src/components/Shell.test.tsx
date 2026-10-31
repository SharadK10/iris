import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Shell from './Shell'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Shell>
        <p>page</p>
      </Shell>
    </MemoryRouter>,
  )
}

describe('Shell', () => {
  it('shows a header link home named Iris away from Home', () => {
    renderAt('/write')
    expect(screen.getByRole('link', { name: 'Iris' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: /Switch to (dark|light) mode/ })).toBeInTheDocument()
  })

  it('leaves the brand to the Home page itself but keeps the toggle', () => {
    renderAt('/')
    expect(screen.queryByRole('link', { name: 'Iris' })).toBeNull()
    expect(screen.getByRole('button', { name: /Switch to (dark|light) mode/ })).toBeInTheDocument()
  })

  it('keeps the powered-by footer with a logo that survives dark mode', () => {
    renderAt('/write')
    expect(screen.getByText('powered by')).toBeInTheDocument()
    expect(screen.getByAltText('liv2code')).toHaveClass('footer-logo')
  })

  it('renders the page content', () => {
    renderAt('/write')
    expect(screen.getByText('page')).toBeInTheDocument()
  })
})
