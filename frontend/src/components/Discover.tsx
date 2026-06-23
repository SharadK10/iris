import { useEffect, useRef, useState } from 'react'
import { searchTracks, ApiError } from '../api'
import SectionTitle from './SectionTitle'
import { PlusIcon, CloseIcon } from './icons'
import { formatDuration } from '../format'
import type { Bloom } from '../types'

export default function Discover({
  onAdd,
  onClose,
}: {
  onAdd: (bloom: Bloom) => void
  onClose?: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Bloom[]>([])
  const [state, setState] = useState<'idle' | 'searching' | 'done' | 'unavailable' | 'error'>('idle')
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setState('idle')
      return
    }

    const id = ++requestId.current
    setState('searching')
    const timer = setTimeout(() => {
      searchTracks(trimmed)
        .then((tracks) => {
          if (id !== requestId.current) return
          setResults(tracks)
          setState('done')
        })
        .catch((err) => {
          if (id !== requestId.current) return
          setState(err instanceof ApiError && err.status === 503 ? 'unavailable' : 'error')
        })
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <section className="flex flex-col gap-3">
      <div className="relative flex items-center justify-center">
        <SectionTitle>Discover</SectionTitle>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-0 text-sm text-muted transition hover:text-ink"
          >
            Done
          </button>
        )}
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, or albums..."
          className="w-full rounded-bloom border border-line bg-paper-dark px-4 py-2.5 pr-11 text-ink placeholder:text-muted focus:border-iris-soft focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-paper hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {state === 'searching' && <p className="text-sm text-muted">Searching…</p>}
      {state === 'unavailable' && (
        <p className="text-sm text-muted">Search isn’t set up yet — a YouTube API key is needed.</p>
      )}
      {state === 'error' && <p className="text-sm text-muted">Search went quiet. Try again.</p>}
      {state === 'done' && results.length === 0 && (
        <p className="text-sm text-muted">Nothing found.</p>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col">
          {results.map((track) => (
            <li
              key={track.videoId}
              className="group flex items-center gap-4 border-b border-line py-3 last:border-0"
            >
              <img
                src={track.thumbnail}
                alt=""
                className="h-12 w-12 shrink-0 rounded-bloom object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-ink">{track.title}</p>
                <p className="truncate text-sm text-muted">{track.artist}</p>
              </div>
              {track.duration > 0 && (
                <span className="shrink-0 font-mono text-xs text-muted">
                  {formatDuration(track.duration)}
                </span>
              )}
              <button
                onClick={() => onAdd(track)}
                aria-label="Add to Garden"
                title="Add to Garden"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition hover:border-iris-soft hover:bg-paper-dark"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
