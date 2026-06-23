import { useState } from 'react'

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
        <h1 className="font-serif text-4xl font-medium tracking-tight text-ink">Iris</h1>
        <p className="font-serif text-lg italic text-muted">
          You are joining Echo <span className="not-italic tracking-widest text-ink">{code}</span>
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col items-center gap-4">
        <p className="font-serif text-xl text-ink">What should we call you?</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={24}
          className="w-56 rounded-bloom border border-line bg-paper-dark px-4 py-2 text-center text-ink placeholder:text-muted focus:border-iris-soft focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-bloom border border-line px-6 py-2.5 text-ink transition hover:border-iris-soft hover:bg-paper-dark"
        >
          Enter
        </button>
      </form>
    </div>
  )
}
