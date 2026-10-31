import { useRef, useState } from 'react'
import YouTubePlayer, { type YouTubePlayerHandle } from './YouTubePlayer'
import SectionTitle from './SectionTitle'
import Sunflower from './botanical/Sunflower'
import { PlayIcon, PauseIcon, NextIcon, RestartIcon } from './icons'
import { formatDuration } from '../format'
import { REACTIONS, type Bloom as BloomTrack, type FloatingReaction } from '../types'

const controlClass =
  'flex items-center justify-center rounded-full border border-line bg-paper text-ink transition hover:border-iris-soft hover:bg-paper-dark'

// iOS browsers (including Chrome) all run WebKit, which blocks programmatic audio
// playback unless it originates from a user gesture. These users need an explicit
// tap to unlock the player; everyone else can rely on socket-driven playback.
const needsUnlock =
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

export default function Bloom({
  bloom,
  playing,
  positionBase,
  anchorTime,
  clockSkew,
  isConductor,
  canStart,
  reactions,
  onPlay,
  onPause,
  onNext,
  onSeek,
  onReact,
}: {
  bloom: BloomTrack | null
  playing: boolean
  positionBase: number
  anchorTime: number
  clockSkew: number
  isConductor: boolean
  canStart: boolean
  reactions: FloatingReaction[]
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onSeek: (seconds: number) => void
  onReact: (emoji: string) => void
}) {
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [scrub, setScrub] = useState<number | null>(null)
  const playerRef = useRef<YouTubePlayerHandle>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const showUnlock = needsUnlock && !unlocked && !!bloom

  if (!bloom) {
    return (
      <section className="card flex flex-col gap-4">
        <SectionTitle variant="bloom">In Bloom</SectionTitle>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-16 w-16 shrink-0 rounded-bloom bg-paper-dark sm:h-24 sm:w-24" />
          <p className="flex-1 font-serif text-lg italic text-muted">Nothing in bloom yet.</p>
          {isConductor ? (
            <button
              onClick={onNext}
              disabled={!canStart}
              className="btn-ghost shrink-0 px-4 py-2 text-sm disabled:opacity-50"
            >
              Play
            </button>
          ) : (
            <span className="shrink-0 text-sm text-muted">Waiting…</span>
          )}
        </div>
      </section>
    )
  }

  const max = duration || bloom.duration || 0
  const value = scrub ?? current
  const progress = max ? (Math.min(value, max) / max) * 100 : 0

  return (
    <section className="card relative flex flex-col gap-4">
      <SectionTitle variant="bloom">In Bloom</SectionTitle>

      {showUnlock && (
        <button
          onClick={() => {
            playerRef.current?.unlock()
            setUnlocked(true)
          }}
          disabled={!playerReady}
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] bg-ground/85 text-ink backdrop-blur-sm disabled:opacity-70"
        >
          <span className="font-serif text-lg italic">
            {playerReady
              ? `Tap to ${isConductor ? 'enable sound' : 'join the music'}`
              : 'Preparing…'}
          </span>
        </button>
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative shrink-0">
          <img
            src={bloom.thumbnail}
            alt=""
            className="specimen-art h-16 w-16 rounded-md object-cover sm:h-24 sm:w-24"
          />
          {/* A sunflower tucked under the pressed specimen. */}
          <Sunflower className="day-only pointer-events-none absolute -bottom-6 -right-4 w-8 rotate-12 sm:w-10" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg text-ink sm:text-xl">{bloom.title}</p>
          <p className="truncate text-sm text-muted">{bloom.artist}</p>
        </div>

        {isConductor ? (
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => onSeek(0)} aria-label="Restart" className={`${controlClass} h-9 w-9`}>
              <RestartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={playing ? onPause : onPlay}
              aria-label={playing ? 'Pause' : 'Play'}
              className={`${controlClass} h-12 w-12`}
            >
              {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button onClick={onNext} aria-label="Next" className={`${controlClass} h-9 w-9`}>
              <NextIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="shrink-0 text-xs text-muted">Following the Gardener</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={max}
          value={Math.min(value, max)}
          disabled={!isConductor}
          onChange={(e) => setScrub(Number(e.target.value))}
          onPointerUp={() => {
            if (scrub !== null) {
              onSeek(scrub)
              setScrub(null)
            }
          }}
          className="stem-range w-full disabled:cursor-default disabled:opacity-70"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <div className="flex justify-between font-mono text-xs text-muted">
          <span>{formatDuration(Math.floor(value))}</span>
          <span>{formatDuration(max)}</span>
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-1.5">
        {/* Reactions float up from just above the bar, like petals lifting off. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full h-36">
          {reactions.map((reaction) => (
            <span
              key={reaction.id}
              className="reaction-rise absolute bottom-0 flex flex-col items-center"
              style={{ left: `${reaction.x}%`, '--sway': `${(Math.round(reaction.x) % 2 ? 1 : -1) * 8}deg` } as React.CSSProperties}
            >
              <span className="text-2xl leading-none">{reaction.emoji}</span>
              <span className="mt-0.5 max-w-20 truncate text-[10px] text-muted">{reaction.nickname}</span>
            </span>
          ))}
        </div>

        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            aria-label={`React ${emoji}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ground text-base leading-none transition hover:-translate-y-0.5 hover:border-iris-soft hover:bg-paper-dark active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 h-[180px] w-[320px]">
        <YouTubePlayer
          ref={playerRef}
          videoId={bloom.videoId}
          playing={playing}
          positionBase={positionBase}
          anchorTime={anchorTime}
          clockSkew={clockSkew}
          onReady={() => setPlayerReady(true)}
          onEnded={isConductor ? onNext : () => {}}
          onProgress={(c, d) => {
            setCurrent(c)
            setDuration(d)
          }}
        />
      </div>
    </section>
  )
}
