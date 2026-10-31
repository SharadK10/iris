import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Bloom from './Bloom'

vi.mock('./YouTubePlayer', async () => {
  const { forwardRef } = await import('react')
  return { default: forwardRef(() => null) }
})

const bloom = {
  videoId: 'abc',
  title: 'Paper Lanterns',
  artist: 'The Quiet Hours',
  thumbnail: 'https://example.com/t.jpg',
  duration: 200,
}

function renderBloom(isConductor: boolean) {
  const noop = () => {}
  return render(
    <Bloom
      bloom={bloom}
      playing={false}
      positionBase={0}
      anchorTime={0}
      clockSkew={0}
      isConductor={isConductor}
      canStart
      reactions={[]}
      onPlay={noop}
      onPause={noop}
      onNext={noop}
      onSeek={noop}
      onReact={noop}
    />,
  )
}

describe('Bloom', () => {
  it('keeps the six reactions, in order', () => {
    renderBloom(true)
    const labels = screen.getAllByRole('button', { name: /^React / }).map((b) => b.getAttribute('aria-label'))
    expect(labels).toEqual(['React 🌻', 'React 🌸', 'React 💜', 'React ❤️', 'React 🔥', 'React 🥹'])
  })

  it('keeps the conductor controls', () => {
    renderBloom(true)
    for (const name of ['Restart', 'Play', 'Next']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('tells listeners they follow the Gardener', () => {
    renderBloom(false)
    expect(screen.getByText('Following the Gardener')).toBeInTheDocument()
  })

  it('keeps the In Bloom heading and title', () => {
    renderBloom(true)
    expect(screen.getByRole('heading', { name: 'In Bloom' })).toBeInTheDocument()
    expect(screen.getByText('Paper Lanterns')).toBeInTheDocument()
  })

  it('draws the progress as a stem', () => {
    renderBloom(true)
    expect(screen.getByRole('slider')).toHaveClass('stem-range')
  })

  it('marks In Bloom with the iris, never the sunflower', () => {
    renderBloom(true)
    const heading = screen.getByRole('heading', { name: 'In Bloom' })
    expect(heading.querySelector('[data-mark="iris-head"]')).not.toBeNull()
    expect(heading.querySelector('[data-mark="sunflower-head"]')).toBeNull()
  })
})
