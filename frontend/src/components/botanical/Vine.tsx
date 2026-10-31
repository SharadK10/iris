/** A gently waving stem line that stretches to fill its box — used as a divider. */
export default function Vine({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 12"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 6 C 50 2 100 10 150 6 S 250 2 300 6"
        stroke="rgb(var(--leaf))"
        strokeOpacity="0.6"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
