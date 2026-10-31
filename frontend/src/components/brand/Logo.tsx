/**
 * The Iris mark: an iris seen from above — three deep falls, three lighter
 * standards, gold beards at the heart. The only geometric drawing in Iris;
 * everything else is botanical. Colours are fixed so it reads the same in both modes.
 */
const FALL = 'M0 4 C -28 18 -34 62 -2 84 C 0 86 0 86 2 84 C 34 62 28 18 0 4Z'
const STANDARD = 'M0 -2 C -18 -14 -22 -48 0 -70 C 22 -48 18 -14 0 -2Z'
const TURNS = [0, 120, 240]

export default function Logo({
  className,
  title = 'Iris',
  decorative = false,
}: {
  className?: string
  title?: string
  /** Hide from assistive tech when a visible "Iris" label sits beside the mark. */
  decorative?: boolean
}) {
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title }

  return (
    <svg className={className} viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" {...a11y}>
      <g fill="#5a4ecf">
        {TURNS.map((t) => (
          <path key={t} d={FALL} transform={`rotate(${t})`} />
        ))}
      </g>
      <g fill="#a79cff" fillOpacity="0.92">
        {TURNS.map((t) => (
          <path key={t} d={STANDARD} transform={`rotate(${t})`} />
        ))}
      </g>
      <g fill="#e8b23a">
        {TURNS.map((t) => (
          <rect key={t} x="-4" y="14" width="8" height="30" rx="4" transform={`rotate(${t})`} />
        ))}
        <circle r="7" />
      </g>
    </svg>
  )
}
