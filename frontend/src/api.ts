import type { Bloom, Echo } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

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

export { ApiError }
