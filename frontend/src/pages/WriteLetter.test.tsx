import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import WriteLetter from './WriteLetter'

// Stand in for search: one button that picks a fixed bloom.
vi.mock('../components/Discover', () => ({
  default: ({ onAdd }: { onAdd: (b: unknown) => void }) => (
    <button
      onClick={() =>
        onAdd({ videoId: 'v1', title: 'Paper Lanterns', artist: 'The Quiet Hours', thumbnail: 't.jpg', duration: 144 })
      }
    >
      pick test bloom
    </button>
  ),
}))

function renderWrite() {
  return render(
    <MemoryRouter>
      <WriteLetter />
    </MemoryRouter>,
  )
}

describe('WriteLetter', () => {
  it('keeps every existing piece of copy and control', () => {
    renderWrite()
    expect(screen.getByRole('heading', { name: 'Write a letter' })).toBeInTheDocument()
    expect(screen.getByText('A bouquet of songs, sealed and sent to someone.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Dear…')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Yours…')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write something to open with…')).toBeInTheDocument()
    expect(screen.getByText('No blooms picked yet.')).toBeInTheDocument()
    expect(screen.getByText('0/30 blooms')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seal & send' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Never mind' })).toBeInTheDocument()
  })

  it('makes Seal & send the primary action', () => {
    renderWrite()
    expect(screen.getByRole('button', { name: 'Seal & send' })).toHaveClass('btn-primary')
  })

  it('a picked bloom keeps its controls, gets a handwritten note field and a gold numeral', () => {
    renderWrite()
    fireEvent.click(screen.getByText('pick test bloom'))
    for (const name of ['Move up', 'Move down', 'Remove']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByPlaceholderText('Leave a note (optional)…')).toHaveClass('field-note')
    expect(screen.getByText('1')).toHaveClass('text-gold')
  })
})
