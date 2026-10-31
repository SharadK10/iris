// A small, quiet mark that a letter is "pressed" — paid for and kept forever.
// Just an iris flower in a soft pill: iris-soft petals with a sunflower heart.
export default function PressedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Pressed — kept forever"
      title="Pressed — kept forever"
      className={`inline-flex items-center justify-center rounded-full border border-line bg-paper-dark p-1.5 ${className}`}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
        <g className="fill-iris-soft">
          <circle cx="8" cy="3.4" r="2.1" />
          <circle cx="12.4" cy="6.6" r="2.1" />
          <circle cx="10.7" cy="11.8" r="2.1" />
          <circle cx="5.3" cy="11.8" r="2.1" />
          <circle cx="3.6" cy="6.6" r="2.1" />
        </g>
        <circle cx="8" cy="8" r="1.9" className="fill-sunflower" />
      </svg>
    </span>
  )
}
