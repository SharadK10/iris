export interface YTPlayer {
  loadVideoById(videoId: string, startSeconds?: number): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  destroy(): void
}

export interface YTStateChangeEvent {
  data: number
  target: YTPlayer
}

export interface YTPlayerOptions {
  videoId?: string
  width?: string | number
  height?: string | number
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: { target: YTPlayer }) => void
    onStateChange?: (event: YTStateChangeEvent) => void
  }
}

export interface YTNamespace {
  Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayer
  PlayerState: {
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
    UNSTARTED: number
  }
}

interface YTWindow {
  YT?: YTNamespace
  onYouTubeIframeAPIReady?: () => void
}

const ytWindow = window as unknown as YTWindow

let apiPromise: Promise<YTNamespace> | null = null

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YTNamespace>((resolve) => {
    if (ytWindow.YT && ytWindow.YT.Player) {
      resolve(ytWindow.YT)
      return
    }
    const previous = ytWindow.onYouTubeIframeAPIReady
    ytWindow.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (ytWindow.YT) resolve(ytWindow.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })

  return apiPromise
}
