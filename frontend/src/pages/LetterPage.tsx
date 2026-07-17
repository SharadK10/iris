import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLetter, openLetter, ApiError } from '../api'
import LetterPlayer, { type LetterPlayerHandle } from '../components/LetterPlayer'
import Envelope from '../components/Envelope'
import BloomBurst from '../components/BloomBurst'
import { PlayIcon, PauseIcon, NextIcon, RestartIcon } from '../components/icons'
import { formatDuration } from '../format'
import type { Letter } from '../types'

type Status = 'loading' | 'notfound' | 'error' | 'sealed' | 'opening' | 'reading'

const controlClass =
  'flex items-center justify-center rounded-full border border-line bg-ground text-ink transition hover:border-sunflower hover:bg-paper-dark disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-ground'

function sealedOn(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function LetterPage() {
  const { id = '' } = useParams()
  const [status, setStatus] = useState<Status>('loading')
  const [letter, setLetter] = useState<Letter | null>(null)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [finished, setFinished] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [scrub, setScrub] = useState<number | null>(null)

  const playerRef = useRef<LetterPlayerHandle>(null)
  const playingRef = useRef(false)
  playingRef.current = playing
  const openTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(openTimer.current), [])

  useEffect(() => {
    let cancelled = false
    getLetter(id)
      .then((found) => {
        if (cancelled) return
        setLetter(found)
        setStatus(found.opened ? 'reading' : 'sealed')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus(err instanceof ApiError && err.status === 404 ? 'notfound' : 'error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function open() {
    if (status === 'opening') return
    // Start the first bloom inside this tap so iOS lets the audio play.
    playerRef.current?.play()
    setPlaying(true)
    setStatus('opening')
    openLetter(id).catch(() => {
      // Best-effort: the letter already reads; only the "opened" flag may lag.
    })
    // Let the envelope lift and the blooms spill out before the letter unfolds.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    openTimer.current = window.setTimeout(() => setStatus('reading'), reduce ? 450 : 1500)
  }

  function togglePlay() {
    if (playing) {
      playerRef.current?.pause()
      setPlaying(false)
    } else {
      playerRef.current?.play()
      setPlaying(true)
    }
  }

  function goTo(next: number) {
    if (!letter) return
    if (next < 0) return
    if (next >= letter.bouquet.length) {
      setPlaying(false)
      setFinished(true)
      return
    }
    setFinished(false)
    setPlaying(true)
    setCurrent(0)
    setDuration(0)
    setScrub(null)
    setIndex(next)
  }

  function readAgain() {
    setFinished(false)
    setCurrent(0)
    setDuration(0)
    setScrub(null)
    setPlaying(true)
    if (index === 0) {
      playerRef.current?.seek(0)
      playerRef.current?.play()
    } else {
      setIndex(0)
    }
  }

  if (status === 'loading') {
    return <Centered>Unfolding…</Centered>
  }
  if (status === 'notfound') {
    return (
      <Centered>
        <p className="font-serif text-2xl text-ink">This letter has drifted away.</p>
        <p className="text-sm text-muted">The link may be wrong, or the letter has faded.</p>
        <HomeLink />
      </Centered>
    )
  }
  if (status === 'error' || !letter) {
    return (
      <Centered>
        <p className="font-serif text-2xl text-ink">The letter wouldn’t open.</p>
        <p className="text-sm text-muted">Something went quiet. Try again in a moment.</p>
        <HomeLink />
      </Centered>
    )
  }

  const forName = letter.recipient?.trim()
  const stem = letter.bouquet[index]
  const bloom = stem.bloom
  const max = duration || bloom.duration || 0
  const value = scrub ?? current
  const total = letter.bouquet.length

  // The player is mounted once and kept stable across the sealed → reading swap,
  // so the instance blessed by the "Open the letter" tap is the one that plays.
  return (
    <div className="flex flex-col gap-8">
      {status === 'sealed' || status === 'opening' ? (
        <div className="flex flex-col items-center gap-8 py-4 text-center">
          <p className="font-serif text-lg italic text-muted">
            {status === 'opening' ? 'Opening…' : 'A letter has arrived.'}
          </p>

          {/* The envelope, addressed and sealed. Tap it to open; blooms spill out. */}
          <div className="relative w-full max-w-sm">
            <button
              onClick={open}
              disabled={status === 'opening'}
              aria-label="Open the letter"
              className="block w-full rounded-canvas transition hover:-translate-y-0.5 hover:shadow-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-sunflower disabled:cursor-default"
            >
              <Envelope name={forName || 'you'} opening={status === 'opening'} />
            </button>
            {status === 'opening' && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
                <BloomBurst />
              </div>
            )}
          </div>

          {status === 'sealed' && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={open}
                className="rounded-bloom border border-sunflower bg-sunflower-soft/30 px-8 py-3 text-ink transition hover:bg-sunflower-soft/50"
              >
                Open the letter
              </button>
              <p className="text-xs text-muted">Once opened, it can’t be sealed again.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="soft-in flex flex-col gap-8">
          <header className="flex flex-col gap-3 text-center">
            <p className="font-serif text-2xl text-ink sm:text-3xl">
              {forName ? `Dear ${forName},` : 'Dear you,'}
            </p>
            {letter.opening?.trim() && (
              <p className="mx-auto max-w-prose whitespace-pre-line font-serif text-lg italic leading-relaxed text-muted">
                {letter.opening.trim()}
              </p>
            )}
          </header>

          {finished ? (
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <p className="font-serif text-2xl italic text-ink">
                {letter.sender?.trim() ? `Yours, ${letter.sender.trim()}` : 'Yours,'}
              </p>
              <p className="text-sm text-muted">sealed {sealedOn(letter.sealedAt)}</p>
              <button
                onClick={readAgain}
                className="rounded-bloom border border-line px-6 py-2.5 text-ink transition hover:border-sunflower hover:bg-paper-dark"
              >
                Read again
              </button>
            </div>
          ) : (
            <section className="flex flex-col items-center gap-6">
              <img
                src={bloom.thumbnail}
                alt=""
                className="h-40 w-40 rounded-bloom object-cover shadow-paper sm:h-48 sm:w-48"
              />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="font-serif text-xl text-ink sm:text-2xl">{bloom.title}</p>
                <p className="text-sm text-muted">{bloom.artist}</p>
              </div>

              {/* The note rises as its bloom begins, and lingers. Keyed to re-play per bloom. */}
              <div className="min-h-[2rem]">
                {stem.note?.trim() && (
                  <p
                    key={index}
                    className="note-rise mx-auto max-w-prose whitespace-pre-line text-center font-serif text-lg italic leading-relaxed text-ink"
                  >
                    {stem.note.trim()}
                  </p>
                )}
              </div>

              <div className="flex w-full max-w-md flex-col gap-1.5">
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={Math.min(value, max)}
                  onChange={(e) => setScrub(Number(e.target.value))}
                  onPointerUp={() => {
                    if (scrub !== null) {
                      playerRef.current?.seek(scrub)
                      setScrub(null)
                    }
                  }}
                  className="h-1 w-full accent-sunflower"
                />
                <div className="flex justify-between font-mono text-xs text-muted">
                  <span>{formatDuration(Math.floor(value))}</span>
                  <span>{formatDuration(max)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  aria-label="Previous"
                  className={`${controlClass} h-9 w-9`}
                >
                  <RestartIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className={`${controlClass} h-12 w-12`}
                >
                  {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => goTo(index + 1)}
                  aria-label="Next"
                  className={`${controlClass} h-9 w-9`}
                >
                  <NextIcon className="h-4 w-4" />
                </button>
              </div>

              <p className="font-mono text-xs text-muted">
                {index + 1} of {total}
              </p>
            </section>
          )}
        </div>
      )}

      <LetterPlayer
        ref={playerRef}
        videoId={bloom.videoId}
        onReady={() => {
          if (playingRef.current) playerRef.current?.play()
        }}
        onEnded={() => goTo(index + 1)}
        onProgress={(c, d) => {
          setCurrent(c)
          setDuration(d)
        }}
      />
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center font-serif text-lg italic text-muted">
      {children}
    </div>
  )
}

function HomeLink() {
  return (
    <Link to="/" className="mt-2 text-sm not-italic text-muted transition hover:text-ink">
      Back home
    </Link>
  )
}
