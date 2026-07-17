import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { loadYouTubeApi, type YTPlayer } from '../youtube'

export interface LetterPlayerHandle {
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
}

type LetterPlayerProps = {
  videoId: string
  onEnded: () => void
  onProgress: (current: number, duration: number) => void
  onReady?: () => void
}

/**
 * A solo YouTube player for reading a Letter — no sync, no drift correction.
 * The bloom being read is driven entirely by the `videoId` prop; loading a new
 * one auto-plays. The parent starts the first bloom via play() inside a user
 * gesture (the "Open the letter" tap), which blesses the session on iOS so the
 * later auto-advances are allowed to play.
 */
const LetterPlayer = forwardRef<LetterPlayerHandle, LetterPlayerProps>(function LetterPlayer(
  { videoId, onEnded, onProgress, onReady },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)

  const onEndedRef = useRef(onEnded)
  const onProgressRef = useRef(onProgress)
  const onReadyRef = useRef(onReady)
  onEndedRef.current = onEnded
  onProgressRef.current = onProgress
  onReadyRef.current = onReady

  useImperativeHandle(ref, () => ({
    play() {
      playerRef.current?.playVideo()
    },
    pause() {
      playerRef.current?.pauseVideo()
    },
    seek(seconds: number) {
      playerRef.current?.seekTo(Math.max(0, seconds), true)
    },
  }))

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
    // Mount once; the first bloom is set via the constructor's videoId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Turn to the next bloom — loadVideoById auto-plays the session we've blessed.
  useEffect(() => {
    if (readyRef.current && playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  return (
    <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 h-[180px] w-[320px]">
      <div ref={hostRef} className="h-full w-full" />
    </div>
  )
})

export default LetterPlayer
