import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { loadYouTubeApi, type YTPlayer } from '../youtube'

// Re-sync when the player drifts from the live position by more than this.
const DRIFT_TOLERANCE = 0.75
// A fresh seek needs time to buffer before it reaches the target. Don't re-judge
// drift until it settles, or we thrash — pronounced on iOS, which buffers slower.
const SETTLE_MS = 1800

export interface YouTubePlayerHandle {
  /**
   * Must be called synchronously from a user gesture (tap/click). iOS WebKit —
   * which backs every iOS browser including Chrome — only permits audio to start
   * as the direct result of a user interaction. This "blesses" the player for the
   * rest of the session so later socket-driven playVideo() calls are allowed.
   */
  unlock: () => void
}

type YouTubePlayerProps = {
  videoId: string
  playing: boolean
  positionBase: number
  anchorTime: number
  clockSkew: number
  onEnded: () => void
  onProgress: (current: number, duration: number) => void
  onReady?: () => void
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(function YouTubePlayer(
  { videoId, playing, positionBase, anchorTime, clockSkew, onEnded, onProgress, onReady },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  const lastSeekAtRef = useRef(0)

  const playingRef = useRef(playing)
  const baseRef = useRef(positionBase)
  const anchorRef = useRef(anchorTime)
  const skewRef = useRef(clockSkew)
  const onEndedRef = useRef(onEnded)
  const onProgressRef = useRef(onProgress)
  const onReadyRef = useRef(onReady)
  playingRef.current = playing
  baseRef.current = positionBase
  anchorRef.current = anchorTime
  skewRef.current = clockSkew
  onEndedRef.current = onEnded
  onProgressRef.current = onProgress
  onReadyRef.current = onReady

  useImperativeHandle(ref, () => ({
    unlock() {
      const player = playerRef.current
      if (!readyRef.current || !player) return
      syncSeek()
      if (playingRef.current) {
        player.playVideo()
      } else {
        // Consume the gesture silently so the player is unlocked without a blip.
        player.mute()
        player.playVideo()
        player.pauseVideo()
        player.unMute()
      }
    },
  }))

  function targetPosition() {
    if (!playingRef.current) return baseRef.current
    const elapsed = (Date.now() - skewRef.current - anchorRef.current) / 1000
    return baseRef.current + Math.max(0, elapsed)
  }

  // Seek to the live position, optionally leading ahead to absorb seek/buffer
  // latency, and start the settle window so correct() leaves it alone to buffer.
  function syncSeek(lead = 0) {
    const player = playerRef.current
    if (!player) return
    player.seekTo(targetPosition() + lead, true)
    lastSeekAtRef.current = Date.now()
  }

  function correct() {
    const player = playerRef.current
    if (!readyRef.current || !player) return
    if (Date.now() - lastSeekAtRef.current < SETTLE_MS) return
    const drift = targetPosition() - player.getCurrentTime() // +ve => behind live
    if (Math.abs(drift) > DRIFT_TOLERANCE) {
      // While playing, lead ahead by the lag: the seek/buffer costs roughly
      // `drift` seconds and the live position advances by ~the same amount, so
      // playback lands on the beat. This converges regardless of how slow the
      // device buffers (iOS Safari/Chrome included), so all listeners agree.
      syncSeek(playingRef.current ? Math.max(0, drift) : 0)
    }
  }

  useEffect(() => {
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return
      const mount = document.createElement('div')
      hostRef.current.appendChild(mount)

      playerRef.current = new YT.Player(mount, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            readyRef.current = true
            const player = playerRef.current
            if (!player) return
            syncSeek()
            if (playingRef.current) player.playVideo()
            onReadyRef.current?.()
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) onEndedRef.current()
          },
        },
      })
    })

    const ticker = setInterval(() => {
      const player = playerRef.current
      if (readyRef.current && player) {
        correct()
        onProgressRef.current(player.getCurrentTime(), player.getDuration())
      }
    }, 1000)

    return () => {
      cancelled = true
      clearInterval(ticker)
      playerRef.current?.destroy()
      playerRef.current = null
      readyRef.current = false
      if (hostRef.current) hostRef.current.innerHTML = ''
    }
  }, [])

  useEffect(() => {
    if (readyRef.current && playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId, targetPosition())
      lastSeekAtRef.current = Date.now()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  useEffect(() => {
    const player = playerRef.current
    if (!readyRef.current || !player) return
    if (playing) {
      syncSeek()
      player.playVideo()
    } else {
      player.pauseVideo()
      syncSeek()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  useEffect(() => {
    if (readyRef.current && playerRef.current) syncSeek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionBase, anchorTime])

  return (
    <div className="aspect-video w-full overflow-hidden rounded-bloom bg-paper-dark">
      <div ref={hostRef} className="h-full w-full" />
    </div>
  )
})

export default YouTubePlayer
