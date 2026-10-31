/** A single small leaf, drawn like the leaves on the botanical iris and sunflower. */
export default function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M1 11 C 3 4 10 1 19 1 C 16 8 9 11 1 11Z"
        fill="#aab06f"
        fillOpacity="0.7"
        stroke="rgb(var(--leaf))"
        strokeWidth="0.8"
      />
    </svg>
  )
}
