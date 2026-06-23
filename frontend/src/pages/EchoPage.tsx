import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEcho, ApiError } from '../api'
import { conductorIdFor, getNickname, listenerId, setNickname } from '../session'
import { useEchoSocket } from '../socket'
import NameGate from '../components/NameGate'
import Bloom from '../components/Bloom'
import Discover from '../components/Discover'
import Garden from '../components/Garden'
import Listeners from '../components/Listeners'
import type { Echo } from '../types'

function Divider() {
  return <div className="border-t border-line" />
}

export default function EchoPage() {
  const { code = '' } = useParams()
  const [echo, setEcho] = useState<Echo | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [nickname, setNicknameState] = useState(getNickname())
  const [clockSkew, setClockSkew] = useState(0)
  const [ripple, setRipple] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    getEcho(code)
      .then((data) => {
        if (!active) return
        setEcho(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (!active) return
        setStatus(err instanceof ApiError && err.status === 404 ? 'missing' : 'error')
      })
    return () => {
      active = false
    }
  }, [code])

  const { status: socketStatus, send } = useEchoSocket(
    echo?.code ?? '',
    status === 'ready' && !!nickname,
    (message) => {
      if (message.type === 'ECHO_STATE') {
        setEcho(message.payload as Echo)
        if (typeof message.serverTime === 'number') {
          setClockSkew(Date.now() - message.serverTime)
        }
      } else if (message.type === 'CONDUCTOR_CHANGED') {
        const { to } = message.payload as { from: string; to: string }
        setRipple(`${to} became the Gardener`)
      }
    },
  )

  useEffect(() => {
    if (!ripple) return
    const timer = setTimeout(() => setRipple(''), 4000)
    return () => clearTimeout(timer)
  }, [ripple])

  useEffect(() => {
    if (socketStatus === 'open' && nickname) {
      send('JOIN_ECHO', {
        listenerId: listenerId(),
        nickname,
        conductorToken: conductorIdFor(code.toUpperCase()),
      })
    }
  }, [socketStatus, nickname, code, send])

  async function copyInvite() {
    await navigator.clipboard.writeText(`${window.location.origin}/echo/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (status === 'loading') {
    return <p className="pt-8 text-center font-serif text-xl italic text-muted">Opening echo…</p>
  }

  if (status === 'missing') {
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <p className="font-serif text-xl italic text-muted">No echo with code {code}.</p>
        <Link to="/" className="text-sm text-iris">
          Back home
        </Link>
      </div>
    )
  }

  if (status === 'error' || !echo) {
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <p className="font-serif text-xl italic text-muted">Something went quiet. Try again.</p>
        <Link to="/" className="text-sm text-iris">
          Back home
        </Link>
      </div>
    )
  }

  if (!nickname) {
    return (
      <NameGate
        code={echo.code}
        onEnter={(name) => {
          setNickname(name)
          setNicknameState(name)
        }}
      />
    )
  }

  const isConductor = listenerId() === echo.conductorId
  const count = echo.listeners.length

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <Link to="/" className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Iris
        </Link>
        <p className="font-serif text-xl text-muted">Echo {echo.code}</p>
        <p className="flex items-center gap-2 text-sm text-muted">
          <span
            title={socketStatus === 'open' ? 'Connected' : 'Connecting…'}
            className={`h-1.5 w-1.5 rounded-full ${socketStatus === 'open' ? 'bg-iris' : 'bg-line'}`}
          />
          {count} {count === 1 ? 'listener' : 'listeners'} present
        </p>
        <div className="flex items-center gap-2 text-sm text-muted">
          <button onClick={copyInvite} className="text-iris transition hover:opacity-70">
            {copied ? 'Copied' : 'Copy invite'}
          </button>
          <span>·</span>
          <span>
            <span className="text-ink">{nickname}</span>
          </span>
        </div>
      </header>

      {ripple && (
        <p className="text-center font-serif text-base italic text-iris">{ripple}</p>
      )}

      <Divider />

      <Bloom
        bloom={echo.currentBloom}
        playing={echo.playing}
        positionBase={echo.position}
        anchorTime={echo.updatedAt}
        clockSkew={clockSkew}
        isConductor={isConductor}
        canStart={echo.garden.length > 0}
        onPlay={() => send('PLAY')}
        onPause={() => send('PAUSE')}
        onNext={() => send('NEXT_BLOOM')}
        onSeek={(seconds) => send('SEEK', { position: seconds })}
      />

      <Divider />

      <Discover onAdd={(bloom) => send('ADD_TO_GARDEN', bloom)} />

      <Divider />

      <Garden
        items={echo.garden}
        onRemove={(itemId) => send('REMOVE_FROM_GARDEN', { itemId })}
      />

      <Divider />

      <Listeners
        listeners={echo.listeners}
        conductorId={echo.conductorId}
        amConductor={isConductor}
        onMakeConductor={(id) => send('TRANSFER_CONDUCTOR', { newConductorId: id })}
      />

      <Divider />

      <p className="text-center font-serif text-lg italic text-muted">
        Different souls, same soundtrack.
      </p>
    </div>
  )
}
