import { useState } from 'react'
import Logo from './brand/Logo'

export default function NameGate({
  code,
  onEnter,
}: {
  code: string
  onEnter: (name: string) => void
}) {
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onEnter(trimmed)
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <Logo className="h-16 w-16" />
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">Iris</h1>
        <p className="font-serif text-lg italic text-muted">
          You are joining Echo <span className="not-italic tracking-widest text-ink">{code}</span>
        </p>
      </div>

      <form onSubmit={submit} className="card flex flex-col items-center gap-4">
        <p className="font-serif text-xl text-ink">What should we call you?</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={24}
          className="field w-56 text-center"
        />
        <button
          type="submit"
          className="btn-primary"
        >
          Enter
        </button>
      </form>
    </div>
  )
}
