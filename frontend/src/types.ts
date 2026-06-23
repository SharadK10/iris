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
