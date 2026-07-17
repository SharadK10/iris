export interface Bloom {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: number
}

export interface Listener {
  id: string
  nickname: string
  joinedAt: string
}

export interface GardenItem {
  id: string
  bloom: Bloom
  addedBy: string
}

// Curated palette kept in sync with the server-side allowlist in EchoSocketHandler.
export const REACTIONS = ['🌻', '🌸', '💜', '❤️', '🔥', '🥹'] as const

export interface FloatingReaction {
  id: string
  emoji: string
  nickname: string
  x: number
}

export interface Echo {
  id: string
  code: string
  listeners: Listener[]
  garden: GardenItem[]
  currentBloom: Bloom | null
  playing: boolean
  position: number
  updatedAt: number
  conductorId: string
}

// A Letter: an async gift carrying a Bouquet of Blooms, each with an optional Note.
export interface Stem {
  id: string
  bloom: Bloom
  note: string | null
}

export interface Letter {
  id: string
  recipient: string | null // Dear ___
  sender: string | null // Yours, ___
  opening: string | null
  bouquet: Stem[]
  opened: boolean
  openedAt: number | null
  sealedAt: number
}

// The payload sent when sealing a letter. Blank fields are trimmed to null server-side.
export interface LetterDraft {
  recipient: string
  sender: string
  opening: string
  bouquet: { bloom: Bloom; note: string }[]
}
