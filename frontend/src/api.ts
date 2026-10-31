import type { Bloom, Checkout, Echo, Letter, LetterDraft, PressPrice } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ""

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function createEcho(): Promise<Echo> {
  return request<Echo>('/api/echoes', { method: 'POST' })
}

export function getEcho(code: string): Promise<Echo> {
  return request<Echo>(`/api/echoes/${encodeURIComponent(code)}`)
}

export function searchTracks(query: string): Promise<Bloom[]> {
  return request<Bloom[]>(`/api/search?q=${encodeURIComponent(query)}`)
}

export function createLetter(draft: LetterDraft): Promise<Letter> {
  return request<Letter>('/api/letters', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
}

export function getLetter(id: string): Promise<Letter> {
  return request<Letter>(`/api/letters/${encodeURIComponent(id)}`)
}

export function openLetter(id: string): Promise<Letter> {
  return request<Letter>(`/api/letters/${encodeURIComponent(id)}/open`, {
    method: 'POST',
  })
}

// The configured one-time price to press a letter.
export function getPressPrice(): Promise<PressPrice> {
  return request<PressPrice>('/api/press/price')
}

// Starts checkout to press (pay to keep forever) a letter.
export function pressLetter(id: string): Promise<Checkout> {
  return request<Checkout>(`/api/letters/${encodeURIComponent(id)}/press`, {
    method: 'POST',
  })
}

export { ApiError }
