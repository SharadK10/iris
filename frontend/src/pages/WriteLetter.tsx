import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createLetter } from '../api'
import Discover from '../components/Discover'
import SectionTitle from '../components/SectionTitle'
import Leaf from '../components/botanical/Leaf'
import Vine from '../components/botanical/Vine'
import { formatDuration } from '../format'
import type { Bloom, Letter } from '../types'

const MAX_NOTE = 280
const MAX_BLOOMS = 30

interface Picked {
  key: string
  bloom: Bloom
  note: string
}

export default function WriteLetter() {
  const [recipient, setRecipient] = useState('')
  const [sender, setSender] = useState('')
  const [opening, setOpening] = useState('')
  const [bouquet, setBouquet] = useState<Picked[]>([])
  const [sealing, setSealing] = useState(false)
  const [error, setError] = useState('')
  const [sealed, setSealed] = useState<Letter | null>(null)

  function pick(bloom: Bloom) {
    setBouquet((prev) =>
      prev.length >= MAX_BLOOMS
        ? prev
        : [...prev, { key: crypto.randomUUID(), bloom, note: '' }],
    )
  }

  function setNote(key: string, note: string) {
    setBouquet((prev) => prev.map((p) => (p.key === key ? { ...p, note } : p)))
  }

  function remove(key: string) {
    setBouquet((prev) => prev.filter((p) => p.key !== key))
  }

  function move(index: number, delta: number) {
    setBouquet((prev) => {
      const next = index + delta
      if (next < 0 || next >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  async function handleSeal() {
    if (bouquet.length === 0) return
    setError('')
    setSealing(true)
    try {
      const letter = await createLetter({
        recipient,
        sender,
        opening,
        bouquet: bouquet.map((p) => ({ bloom: p.bloom, note: p.note })),
      })
      setSealed(letter)
    } catch {
      setError('Could not seal the letter. Try again.')
      setSealing(false)
    }
  }

  if (sealed) {
    return <Sealed letter={sealed} recipient={recipient} />
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-serif text-4xl font-normal text-ink sm:text-5xl">Write a letter</h1>
        <p className="font-serif text-lg italic text-muted">
          A bouquet of songs, sealed and sent to someone.
        </p>
      </header>

      {/* The letter itself — salutation, opening, signature */}
      <section className="card flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm text-muted">To</span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              maxLength={80}
              placeholder="Dear…"
              className="field font-serif text-lg placeholder:font-serif"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm text-muted">From</span>
            <input
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              maxLength={80}
              placeholder="Yours…"
              className="field font-serif text-lg placeholder:font-serif"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">A few opening words (optional)</span>
          <textarea
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Write something to open with…"
            className="field-note resize-none text-lg"
          />
        </label>
      </section>

      {/* The bouquet — picked blooms, each with an optional note */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <SectionTitle>The bouquet</SectionTitle>
          <Vine className="h-3 min-w-0 flex-1" />
        </div>
        {bouquet.length === 0 ? (
          <p className="text-center font-serif text-lg italic text-muted">
            No blooms picked yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {bouquet.map((item, index) => (
              <li
                key={item.key}
                className="card flex flex-col gap-3 p-3 sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center font-serif text-lg italic text-gold">
                    {index + 1}
                  </span>
                  <img
                    src={item.bloom.thumbnail}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{item.bloom.title}</p>
                    <p className="truncate text-sm text-muted">{item.bloom.artist}</p>
                  </div>
                  {item.bloom.duration > 0 && (
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {formatDuration(item.bloom.duration)}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="px-1.5 text-muted transition hover:text-ink disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === bouquet.length - 1}
                      aria-label="Move down"
                      className="px-1.5 text-muted transition hover:text-ink disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => remove(item.key)}
                      aria-label="Remove"
                      className="px-1.5 text-muted transition hover:text-ink"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="relative flex items-start gap-2">
                  <Leaf className="mt-3 h-3 w-5 shrink-0" />
                  <textarea
                    value={item.note}
                    onChange={(e) => setNote(item.key, e.target.value)}
                    maxLength={MAX_NOTE}
                    rows={2}
                    placeholder="Leave a note (optional)…"
                    className="field-note w-full resize-none px-3 py-2"
                  />
                  {item.note.length > 0 && (
                    <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[11px] text-muted">
                      {item.note.length}/{MAX_NOTE}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-center text-xs text-muted">
          {bouquet.length}/{MAX_BLOOMS} blooms
        </p>
      </section>

      {/* Pick more blooms */}
      <Discover onAdd={pick} addLabel="Pick this bloom" />

      {/* Seal & send */}
      <div className="flex flex-col items-center gap-3 pt-2">
        {error && <p className="text-sm text-gold">{error}</p>}
        <button
          onClick={handleSeal}
          disabled={bouquet.length === 0 || sealing}
          className="btn-primary w-full max-w-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sealing ? 'Sealing…' : 'Seal & send'}
        </button>
        <Link to="/" className="text-sm text-muted transition hover:text-ink">
          Never mind
        </Link>
      </div>
    </div>
  )
}

function Sealed({ letter, recipient }: { letter: Letter; recipient: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/letter/${letter.id}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — the input below is selectable as a fallback.
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-serif text-4xl font-normal text-ink sm:text-5xl">Sealed.</h1>
        <p className="font-serif text-lg italic text-muted">
          {recipient.trim() ? `A letter for ${recipient.trim()}.` : 'Your letter is ready.'}
        </p>
      </div>

      <div className="card flex w-full max-w-md flex-col gap-3">
        <p className="text-sm text-muted">Share this link — the letter waits behind it.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="field min-w-0 flex-1 text-sm"
          />
          <button
            onClick={copy}
            className="btn-primary shrink-0 px-5 py-2.5"
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
        <p className="text-xs text-muted">
          The seal only lifts once — let them be the first to open it.
        </p>
      </div>

      <Link to="/" className="text-sm text-muted transition hover:text-ink">
        Back home
      </Link>
    </div>
  )
}
