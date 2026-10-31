import { FALL, STANDARD, VEIN } from './Iris'

const FALLS = [-58, 0, 58]
const STANDARDS = [-40, 0, 40]
const fallScale = (i: number) => (i === 1 ? 1.05 : 0.98)
const standardScale = (i: number) => (i === 1 ? 1 : 0.9)

/**
 * Just the bloom of the botanical iris, for brand marks (wax seal, "In Bloom").
 * `stamp` flattens it into one dark-gold fill, as if pressed into wax.
 */
export default function IrisHead({
  className,
  variant = 'color',
}: {
  className?: string
  variant?: 'color' | 'stamp'
}) {
  const stamp = variant === 'stamp'

  return (
    <svg
      className={className}
      viewBox="-92 -88 184 188"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-mark={stamp ? 'iris-stamp' : 'iris-head'}
    >
      <g
        stroke={stamp ? '#3d2603' : '#6d5ef8'}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={stamp ? '#5a3a05' : '#b3a9ff'}
        fillOpacity={stamp ? 1 : 0.85}
      >
        {STANDARDS.map((a, i) => (
          <path key={a} d={STANDARD} transform={`rotate(${a}) scale(${standardScale(i)})`} />
        ))}
      </g>
      <g
        stroke={stamp ? '#3d2603' : '#5a4ecf'}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={stamp ? '#5a3a05' : '#8b7bff'}
        fillOpacity={stamp ? 1 : 0.9}
      >
        {FALLS.map((a, i) => (
          <path key={a} d={FALL} transform={`rotate(${a}) scale(${fallScale(i)})`} />
        ))}
      </g>
      {stamp ? (
        <g stroke="#f3d68a" strokeOpacity="0.45" strokeWidth="2">
          {FALLS.map((a, i) => (
            <path key={a} d={VEIN} transform={`rotate(${a}) scale(${fallScale(i)})`} />
          ))}
        </g>
      ) : (
        <path
          d="M-5 0 C -7 14 -6 28 -2 42 C -1 45 1 45 2 42 C 6 28 7 14 5 0 C 2 -3 -2 -3 -5 0 Z"
          fill="#e0a92e"
        />
      )}
    </svg>
  )
}
