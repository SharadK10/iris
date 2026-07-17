/**
 * A golden wax seal with an embossed iris motif. The disc is a warm gold
 * gradient with inner highlight/shadow to read as poured wax; the iris is drawn
 * twice — a pale highlight offset up-left under a darker face — to look pressed in.
 */
export default function WaxSeal({ className }: { className?: string }) {
  return (
    <div
      className={`relative rounded-full ${className ?? ''}`}
      style={{
        background:
          'radial-gradient(circle at 35% 28%, #f7df97 0%, #e6b74a 45%, #c8912f 72%, #9c6c22 100%)',
        boxShadow:
          'inset 0 2px 4px rgba(255,246,214,0.65), inset 0 -4px 8px rgba(120,80,20,0.55), 0 5px 12px rgba(80,55,20,0.4)',
      }}
      aria-hidden="true"
    >
      {/* scalloped wax rim */}
      <div
        className="absolute inset-[7%] rounded-full"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(120,80,20,0.35)' }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full p-[24%]">
        <g>
          {/* pale highlight copy, offset up-left for a raised emboss */}
          <g transform="translate(-1.1 -1.1)" fill="#fde6b8" fillOpacity="0.55">
            <ellipse cx="50" cy="40" rx="6.5" ry="19" />
            <ellipse cx="50" cy="40" rx="6.5" ry="19" transform="rotate(-34 50 50)" />
            <ellipse cx="50" cy="40" rx="6.5" ry="19" transform="rotate(34 50 50)" />
            <ellipse cx="50" cy="66" rx="5.5" ry="15" />
          </g>
          {/* darker face */}
          <g fill="#7c5320" fillOpacity="0.7">
            <ellipse cx="50" cy="40" rx="6.5" ry="19" />
            <ellipse cx="50" cy="40" rx="6.5" ry="19" transform="rotate(-34 50 50)" />
            <ellipse cx="50" cy="40" rx="6.5" ry="19" transform="rotate(34 50 50)" />
            <ellipse cx="50" cy="66" rx="5.5" ry="15" />
          </g>
        </g>
      </svg>
    </div>
  )
}
