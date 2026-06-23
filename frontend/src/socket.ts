import { useCallback, useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8199'
const WS_BASE = BASE_URL.replace(/^http/, 'ws')

const HEARTBEAT_MS = 25000
const RECONNECT_MS = 2000

export type ServerEventType =
  | 'ECHO_STATE'
  | 'LISTENER_JOINED'
  | 'LISTENER_LEFT'
  | 'BLOOM_STARTED'
  | 'BLOOM_PAUSED'
  | 'BLOOM_CHANGED'
  | 'GARDEN_UPDATED'
  | 'CONDUCTOR_CHANGED'

export type ClientEventType =
  | 'JOIN_ECHO'
  | 'LEAVE_ECHO'
  | 'PLAY'
  | 'PAUSE'
  | 'SEEK'
  | 'ADD_TO_GARDEN'
  | 'REMOVE_FROM_GARDEN'
  | 'NEXT_BLOOM'
  | 'TRANSFER_CONDUCTOR'
  | 'HEARTBEAT'

export interface ServerMessage {
  type: ServerEventType
  payload: unknown
  serverTime?: number
}

export type SocketStatus = 'connecting' | 'open' | 'closed'

export type SendEvent = (type: ClientEventType, payload?: unknown) => void

export function useEchoSocket(
  code: string,
  enabled: boolean,
  onMessage: (message: ServerMessage) => void,
): { status: SocketStatus; send: SendEvent } {
  const [status, setStatus] = useState<SocketStatus>('closed')
  const socketRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!enabled || !code) return

    let closedByUs = false
    let heartbeat: ReturnType<typeof setInterval> | undefined
    let reconnect: ReturnType<typeof setTimeout> | undefined

    function open() {
      setStatus('connecting')
      const ws = new WebSocket(`${WS_BASE}/ws/echo/${code}`)
      socketRef.current = ws

      ws.onopen = () => {
        setStatus('open')
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'HEARTBEAT', payload: null }))
          }
        }, HEARTBEAT_MS)
      }

      ws.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data) as ServerMessage)
        } catch {
          // Ignore malformed frames.
        }
      }

      ws.onclose = () => {
        if (heartbeat) clearInterval(heartbeat)
        setStatus('closed')
        if (!closedByUs) reconnect = setTimeout(open, RECONNECT_MS)
      }

      ws.onerror = () => ws.close()
    }

    open()

    return () => {
      closedByUs = true
      if (heartbeat) clearInterval(heartbeat)
      if (reconnect) clearTimeout(reconnect)
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [code, enabled])

  const send = useCallback<SendEvent>((type, payload = null) => {
    const ws = socketRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }))
    }
  }, [])

  return { status, send }
}
