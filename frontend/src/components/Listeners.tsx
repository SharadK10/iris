import SectionTitle from './SectionTitle'
import type { Listener } from '../types'

export default function Listeners({
  listeners,
  conductorId,
  amConductor,
  onMakeConductor,
}: {
  listeners: Listener[]
  conductorId: string
  amConductor: boolean
  onMakeConductor: (listenerId: string) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Listeners</SectionTitle>
      {listeners.length === 0 ? (
        <p className="text-center font-serif text-lg italic text-muted">Quiet for now.</p>
      ) : (
        <ul className="mx-auto flex w-full max-w-xs flex-col">
          {listeners.map((listener) => {
            const isConductor = listener.id === conductorId
            return (
              <li
                key={listener.id}
                className="group flex items-center justify-between border-b border-line py-2 last:border-0"
              >
                <span className="text-ink">
                  {listener.nickname}
                  {isConductor && <span className="text-iris"> (Gardener)</span>}
                </span>
                {amConductor && !isConductor && (
                  <button
                    onClick={() => onMakeConductor(listener.id)}
                    className="text-xs text-muted opacity-0 transition hover:text-iris group-hover:opacity-100"
                  >
                    Pass the Garden
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
