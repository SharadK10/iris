/** A short stem with two leaves — a small ornament beside section titles. */
export default function Sprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 12 C 14 10 28 9 42 4" stroke="rgb(var(--leaf))" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M14 10.5 C 14 5 18 2 23 1 C 22 6 19 9 14 10.5Z"
        fill="#aab06f"
        fillOpacity="0.6"
        stroke="rgb(var(--leaf))"
        strokeWidth="0.8"
      />
      <path
        d="M26 8 C 28 12 32 14 37 14 C 35 10 31 8 26 8Z"
        fill="#aab06f"
        fillOpacity="0.6"
        stroke="rgb(var(--leaf))"
        strokeWidth="0.8"
      />
    </svg>
  )
}
