import Iris from './botanical/Iris'
import Sunflower from './botanical/Sunflower'

// A few fireflies for the Night Garden: [left %, top %, delay s].
const FIREFLIES: [number, number, number][] = [
  [12, 18, 0],
  [86, 32, 1.4],
  [70, 12, 2.6],
  [8, 64, 0.8],
]

/**
 * The room the pages sit in: paper grain and warm washes by day; a slow
 * breathing glow and fireflies by night. Sunflower and iris grow at the edges.
 */
export default function Canvas() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="day-only canvas-paper absolute inset-0" />
      <div className="night-only canvas-glow absolute -inset-x-1/4 -top-1/4 h-3/4" />
      {FIREFLIES.map(([left, top, delay]) => (
        <span
          key={`${left}-${top}`}
          className="night-only firefly absolute"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
        />
      ))}
      <Sunflower className="canvas-botanical sway absolute -bottom-6 -left-8 w-28 sm:w-44" />
      <Iris className="canvas-botanical sway sway-late absolute -bottom-4 -right-8 w-24 sm:w-40" />
    </div>
  )
}
