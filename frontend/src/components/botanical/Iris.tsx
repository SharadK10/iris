// A broad "fall" petal (droops down and out) and a slimmer upright "standard".
const FALL =
  'M0 -4 C -11 6 -26 22 -24 47 C -23 67 -13 80 -4 91 C -1 94 1 94 4 91 C 13 80 23 67 24 47 C 26 22 11 6 0 -4 Z'
const STANDARD =
  'M0 -6 C -13 -15 -19 -34 -14 -55 C -10 -70 -4 -77 0 -81 C 4 -77 10 -70 14 -55 C 19 -34 13 -15 0 -6 Z'
const VEIN = 'M0 6 C 2 32 1 60 0 86'

export default function Iris({ className }: { className?: string }) {
  const falls = [-58, 0, 58]
  const standards = [-40, 0, 40]

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
        d="M84 152 C 66 210, 66 262, 78 298 C 92 258, 92 206, 84 152 Z"
        fill="#9aa066"
        fillOpacity="0.38"
        stroke="#8c925a"
        strokeWidth="1.1"
      />
      <path
        d="M116 152 C 134 208, 134 260, 122 298 C 108 258, 108 204, 116 152 Z"
        fill="#aab06f"
        fillOpacity="0.3"
        stroke="#8c925a"
        strokeWidth="1.1"
      />
      {/* stem */}
      <path d="M100 132 L 100 300" stroke="#9aa066" strokeWidth="3" strokeLinecap="round" />

      <g transform="translate(100 124)">
        {/* standards — upright, sit behind */}
        <g stroke="#6d5ef8" strokeWidth="1.1" strokeLinejoin="round">
          {standards.map((a, i) => (
            <path
              key={`s${a}`}
              d={STANDARD}
              fill="#b3a9ff"
              fillOpacity="0.5"
              transform={`rotate(${a}) scale(${i === 1 ? 1 : 0.9})`}
            />
          ))}
        </g>

        {/* falls — broad, drooping, in front */}
        <g stroke="#5a4ecf" strokeWidth="1.1" strokeLinejoin="round">
          {falls.map((a, i) => (
            <path
              key={`f${a}`}
              d={FALL}
              fill="#8b7bff"
              fillOpacity="0.5"
              transform={`rotate(${a}) scale(${i === 1 ? 1.05 : 0.98})`}
            />
          ))}
        </g>

        {/* faint veins running down each fall */}
        <g stroke="#5a4ecf" strokeOpacity="0.35" strokeWidth="0.9" fill="none">
          {falls.map((a, i) => (
            <path key={`v${a}`} d={VEIN} transform={`rotate(${a}) scale(${i === 1 ? 1.05 : 0.98})`} />
          ))}
        </g>

        {/* golden beard on the front fall */}
        <path
          d="M-4 0 C -6 14 -5 28 -2 42 C -1 45 1 45 2 42 C 5 28 6 14 4 0 C 2 -3 -2 -3 -4 0 Z"
          fill="#e0a92e"
          fillOpacity="0.9"
        />
        <g stroke="#cf9f3c" strokeWidth="1" strokeLinecap="round">
          <line x1="-3" y1="7" x2="-6" y2="11" />
          <line x1="3" y1="7" x2="6" y2="11" />
          <line x1="-2" y1="20" x2="-6" y2="24" />
          <line x1="2" y1="20" x2="6" y2="24" />
        </g>

        {/* small heart of the flower */}
        <circle cx="0" cy="-2" r="4.5" fill="#7c6bf0" fillOpacity="0.55" />
      </g>
    </svg>
  )
}
