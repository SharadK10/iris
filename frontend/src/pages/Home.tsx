import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEcho, getEcho, ApiError } from '../api'
import { rememberConductor } from '../session'

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
    <div className="flex flex-col items-center gap-10 text-center sm:gap-14">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-serif text-5xl font-medium tracking-tight text-ink sm:text-6xl">Iris</h1>
        <p className="font-serif text-lg italic text-muted sm:text-xl">Listen, together.</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleCreate}
          disabled={creating}
          className="rounded-bloom border border-line px-8 py-3 text-ink transition hover:border-iris-soft hover:bg-paper-dark disabled:opacity-60"
        >
          {creating ? 'Creating…' : 'Create an Echo'}
        </button>

        <form onSubmit={handleJoin} className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted">Have a code?</p>
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full rounded-bloom border border-line bg-paper-dark px-4 py-2 text-center uppercase tracking-widest text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-iris-soft focus:outline-none sm:w-40"
            />
            <button
              type="submit"
              disabled={joining}
              className="w-full rounded-bloom border border-line px-4 py-2 text-ink transition hover:border-iris-soft hover:bg-paper-dark disabled:opacity-60 sm:w-auto"
            >
              {joining ? 'Joining…' : 'Join an Echo'}
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-sunflower">{error}</p>}
      </div>

      <p className="font-serif text-lg italic text-muted">
        Different souls, same soundtrack.
      </p>
    </div>
  )
}
