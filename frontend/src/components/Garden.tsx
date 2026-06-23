import SectionTitle from './SectionTitle'
import { formatDuration } from '../format'
import type { GardenItem } from '../types'

export default function Garden({
  items,
  onRemove,
}: {
  items: GardenItem[]
  onRemove: (itemId: string) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Garden</SectionTitle>
      {items.length === 0 ? (
        <p className="text-center font-serif text-lg italic text-muted">Nothing planted yet.</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-3 border-b border-line py-2 last:border-0"
            >
              <img
                src={item.bloom.thumbnail}
                alt=""
                className="h-10 w-10 rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-ink">{item.bloom.title}</p>
                <p className="truncate text-sm text-muted">Added by {item.addedBy}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">
                {formatDuration(item.bloom.duration)}
              </span>
              <button
                onClick={() => onRemove(item.id)}
                aria-label="Remove"
                className="shrink-0 px-2 text-muted opacity-0 transition hover:text-ink group-hover:opacity-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
