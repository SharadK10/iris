import type { CSSProperties } from 'react'
import Iris from './botanical/Iris'
import Sunflower from './botanical/Sunflower'

type Piece = {
  dx: number
  dy: number
  rot: number
  delay: number
  size: number
  kind: 'iris' | 'sunflower' | 'petal'
  color: string
}

const PETAL_COLORS = ['var(--iris-soft)', 'var(--sunflower-soft)', 'var(--sunflower)', 'var(--iris)']

// A fan of blooms spilling upward and outward from the seal. Precomputed so the
// spread is deterministic (no per-render randomness).
const PIECES: Piece[] = Array.from({ length: 16 }, (_, i) => {
  const angle = ((-168 + i * (156 / 15)) * Math.PI) / 180 // fan across the top
  const dist = 120 + (i % 4) * 40
  const kind = i % 5 === 0 ? 'iris' : i % 5 === 2 ? 'sunflower' : 'petal'
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    rot: (i % 2 ? 1 : -1) * (80 + (i % 5) * 45),
    delay: (i % 6) * 0.05,
    size: kind === 'petal' ? 12 + (i % 3) * 6 : 34 + (i % 3) * 8,
    kind,
    color: PETAL_COLORS[i % PETAL_COLORS.length],
  }
})

export default function BloomBurst() {
  return (
    <>
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="bloom-burst absolute left-0 top-0 block"
          style={
            {
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
            } as CSSProperties
          }
        >
          {p.kind === 'iris' ? (
            <Iris className="h-full w-full" />
          ) : p.kind === 'sunflower' ? (
            <Sunflower className="h-full w-full" />
          ) : (
            <span
              className="block h-full w-full rotate-45"
              style={{ background: p.color, borderRadius: '50% 50% 50% 0', opacity: 0.85 }}
            />
          )}
        </span>
      ))}
    </>
  )
}
