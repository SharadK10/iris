import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Letter } from '../types'
import LetterPage from './LetterPage'

const api = vi.hoisted(() => ({ getLetter: vi.fn(), openLetter: vi.fn() }))
vi.mock('../api', async (importOriginal) => ({ ...(await importOriginal<object>()), ...api }))

// The YouTube player is replaced by a stub that lets tests end the current bloom.
const player = vi.hoisted(() => ({ onEnded: () => {} }))
vi.mock('../components/LetterPlayer', async () => {
  const { forwardRef, useImperativeHandle } = await import('react')
  return {
    default: forwardRef((props: { onEnded: () => void }, ref) => {
      player.onEnded = props.onEnded
      useImperativeHandle(ref, () => ({ play() {}, pause() {}, seek() {} }))
      return null
    }),
  }
})

const sealedAt = Date.UTC(2026, 9, 31, 12)
const letter = (opened: boolean): Letter => ({
  id: 'L1',
  recipient: 'Meera',
  sender: 'Arun',
  opening: 'A few songs that felt like this week.',
  bouquet: [
    { id: 's1', bloom: { videoId: 'a', title: 'Paper Lanterns', artist: 'Green Day', thumbnail: 'a.jpg', duration: 144 }, note: 'for the long drive home' },
    { id: 's2', bloom: { videoId: 'b', title: 'Low Tide', artist: 'Harbour', thumbnail: 'b.jpg', duration: 200 }, note: null },
  ],
  opened,
  openedAt: opened ? sealedAt : null,
  sealedAt,
})

function renderLetter() {
  return render(
    <MemoryRouter initialEntries={['/letter/L1']}>
      <Routes>
        <Route path="/letter/:id" element={<LetterPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  api.getLetter.mockReset()
  api.openLetter.mockReset().mockResolvedValue(undefined)
})

describe('LetterPage', () => {
  it('a sealed letter keeps its copy, with the iris pressed into the seal', async () => {
    api.getLetter.mockResolvedValue(letter(false))
    const { container } = renderLetter()
    expect(await screen.findByText('A letter has arrived.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Open the letter' }).length).toBeGreaterThan(0)
    expect(screen.getByText('Once opened, it can’t be sealed again.')).toBeInTheDocument()
    const seal = container.querySelector('[data-seal]')!
    expect(seal.querySelector('[data-mark="iris-stamp"]')).not.toBeNull()
    expect(seal.querySelector('[data-mark="sunflower-head"]')).toBeNull()
  })

  it('reading shows the count in gold and the note beside a leaf', async () => {
    api.getLetter.mockResolvedValue(letter(true))
    renderLetter()
    expect(await screen.findByText('Dear Meera,')).toBeInTheDocument()
    expect(screen.getByText('1 of 2')).toHaveClass('text-gold')
    const note = screen.getByText('for the long drive home')
    expect(note.closest('[data-note]')?.querySelector('svg')).not.toBeNull()
  })

  it('after the last bloom the sign-off and seal date still appear', async () => {
    api.getLetter.mockResolvedValue(letter(true))
    renderLetter()
    await screen.findByText('Dear Meera,')
    act(() => player.onEnded())
    act(() => player.onEnded())
    const date = new Date(sealedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    expect(screen.getByText('— Arun')).toBeInTheDocument()
    expect(screen.getByText(`sealed ${date}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Read again' })).toBeInTheDocument()
  })

  it('a missing letter keeps its gentle message', async () => {
    const { ApiError } = await vi.importActual<typeof import('../api')>('../api')
    api.getLetter.mockRejectedValue(new ApiError(404, 'gone'))
    renderLetter()
    expect(await screen.findByText('This letter has drifted away.')).toBeInTheDocument()
    expect(screen.getByText('The link may be wrong, or the letter has faded.')).toBeInTheDocument()
  })
})
