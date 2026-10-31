const CX = 100
const CY = 96
const PETALS = Array.from({ length: 18 }, (_, i) => i * (360 / 18))
// Same golden-angle stipple as Sunflower.tsx, a little bolder at small sizes.
const STIPPLE = Array.from({ length: 24 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180
  const r = 3 + Math.sqrt(i) * 4.4
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
})

/** Just the head of the botanical sunflower — canvas decoration only (e.g. the progress playhead). */
export default function SunflowerHead({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="40 36 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-mark="sunflower-head"
    >
      <g stroke="#cf9f3c" strokeWidth="1.6" strokeLinejoin="round">
        {PETALS.map((angle) => (
          <ellipse
            key={angle}
            cx={CX}
            cy={CY - 50}
            rx="8.5"
            ry="27"
            fill="#f1cc63"
            fillOpacity="0.95"
            transform={`rotate(${angle} ${CX} ${CY})`}
          />
        ))}
      </g>
      <circle cx={CX} cy={CY} r="31" fill="#b77a3a" stroke="#8a5a2b" strokeWidth="2" />
      <g fill="#5e3a18" fillOpacity="0.7">
        {STIPPLE.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.8" />
        ))}
      </g>
    </svg>
  )
}
