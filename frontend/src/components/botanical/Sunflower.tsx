export default function Sunflower({ className }: { className?: string }) {
  const cx = 100
  const cy = 96
  const petals = Array.from({ length: 18 }, (_, i) => i * (360 / 18))
  const stipple = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180
    const r = 3 + Math.sqrt(i) * 4.4
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })

  return (
    <svg
      className={className}
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* stem */}
      <path
        d="M100 124 C 95 175, 106 220, 99 292"
        stroke="#9aa066"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* leaf */}
      <path
        d="M101 205 C 132 188, 160 196, 168 176 C 142 168, 116 178, 101 205 Z"
        fill="#aab06f"
        fillOpacity="0.45"
        stroke="#8c925a"
        strokeWidth="1.1"
      />
      {/* petals */}
      <g stroke="#cf9f3c" strokeWidth="1.1" strokeLinejoin="round">
        {petals.map((angle) => (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy - 50}
            rx="8.5"
            ry="27"
            fill="#f1cc63"
            fillOpacity="0.5"
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}
      </g>
      {/* disc */}
      <circle cx={cx} cy={cy} r="31" fill="#a36a33" fillOpacity="0.32" />
      <circle cx={cx} cy={cy} r="31" stroke="#8a5a2b" strokeWidth="1.2" />
      <g fill="#7c5026" fillOpacity="0.6">
        {stipple.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.3" />
        ))}
      </g>
    </svg>
  )
}
