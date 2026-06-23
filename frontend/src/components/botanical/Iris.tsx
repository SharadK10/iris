const PETAL = 'M0 0 C -13 -28 -9 -64 0 -86 C 9 -64 13 -28 0 0 Z'

export default function Iris({ className }: { className?: string }) {
  const cx = 100
  const cy = 110
  const falls = [158, 180, 202]
  const standards = [-26, 0, 26]

  return (
    <svg
      className={className}
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* sword leaves */}
      <path
        d="M86 150 C 70 210, 70 260, 80 296 C 92 256, 92 206, 86 150 Z"
        fill="#9aa066"
        fillOpacity="0.4"
        stroke="#8c925a"
        strokeWidth="1.1"
      />
      <path
        d="M112 150 C 128 206, 128 258, 118 296 C 106 256, 106 204, 112 150 Z"
        fill="#aab06f"
        fillOpacity="0.32"
        stroke="#8c925a"
        strokeWidth="1.1"
      />
      {/* stem */}
      <path d="M100 120 L 100 300" stroke="#9aa066" strokeWidth="3" strokeLinecap="round" />

      <g transform={`translate(${cx} ${cy})`}>
        {/* falls (drooping) */}
        <g stroke="#6d5ef8" strokeWidth="1.1" strokeLinejoin="round">
          {falls.map((a) => (
            <path
              key={`fall-${a}`}
              d={PETAL}
              fill="#8b7bff"
              fillOpacity="0.34"
              transform={`rotate(${a}) scale(1.08)`}
            />
          ))}
        </g>
        {/* standards (upright) */}
        <g stroke="#5a4ecf" strokeWidth="1.1" strokeLinejoin="round">
          {standards.map((a) => (
            <path
              key={`std-${a}`}
              d={PETAL}
              fill="#a79cff"
              fillOpacity="0.42"
              transform={`rotate(${a}) scale(0.82)`}
            />
          ))}
        </g>
        {/* beard / signal */}
        <ellipse cx="0" cy="14" rx="5.5" ry="11" fill="#e0a92e" fillOpacity="0.7" />
      </g>
    </svg>
  )
}
