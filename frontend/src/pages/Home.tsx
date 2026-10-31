import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEcho, getEcho, ApiError } from '../api'
import { rememberConductor } from '../session'
import Logo from '../components/brand/Logo'
import Vine from '../components/botanical/Vine'

export default function Home() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  async function handleCreate() {
    setError('')
    setCreating(true)
    try {
      const echo = await createEcho()
      rememberConductor(echo.code, echo.conductorId)
      navigate(`/echo/${echo.code}`)
    } catch {
      setError('Could not create an echo. Try again.')
      setCreating(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setError('')
    setJoining(true)
    try {
      await getEcho(trimmed)
      navigate(`/echo/${trimmed}`)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? `No echo with code ${trimmed}.`
          : 'Could not reach that echo. Try again.',
      )
      setJoining(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 text-center sm:gap-12">
      <div className="flex flex-col items-center gap-3">
        <Logo className="sway h-20 w-20 sm:h-24 sm:w-24" />
        <h1 className="font-serif text-5xl font-normal tracking-tight text-ink sm:text-6xl">Iris</h1>
        <p className="font-serif text-lg italic text-muted sm:text-xl">Listen, together.</p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <button onClick={handleCreate} disabled={creating} className="btn-primary w-full">
          {creating ? 'Creating…' : 'Create an Echo'}
        </button>

        <form onSubmit={handleJoin} className="flex w-full flex-col items-center gap-4">
          <p className="vine-divider">
            <Vine />
            Have a code?
            <Vine className="-scale-x-100" />
          </p>
          <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="field w-full text-center uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal sm:flex-1"
            />
            <button type="submit" disabled={joining} className="btn-ghost w-full sm:w-auto">
              {joining ? 'Joining…' : 'Join an Echo'}
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-gold">{error}</p>}
      </div>

      <div className="card flex w-full max-w-sm flex-col items-center gap-3">
        <p className="text-sm text-muted">Not here to listen together?</p>
        <button onClick={() => navigate('/write')} className="btn-ghost border-sunflower-soft hover:border-sunflower">
          Write a letter
        </button>
        <p className="max-w-xs text-sm text-muted">
          A bouquet of songs, sealed and sent to someone.
        </p>
      </div>

      <p className="font-serif text-lg italic text-muted">
        Different souls, same soundtrack.
      </p>
    </div>
  )
}
