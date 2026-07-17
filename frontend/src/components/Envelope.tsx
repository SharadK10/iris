import Iris from './botanical/Iris'
import Sunflower from './botanical/Sunflower'
import WaxSeal from './WaxSeal'

/**
 * The sealed letter as it arrives: a warm paper envelope with an inner frame,
 * a golden wax seal, and flowers watermarked into the corners. When `opening`
 * is set, the envelope lifts and fades away (paired with a bloom burst above it).
 */
export default function Envelope({ name, opening = false }: { name: string; opening?: boolean }) {
  return (
    <div
      className={`relative aspect-[3/2] w-full overflow-hidden rounded-canvas border border-line bg-paper shadow-paper ${
        opening ? 'envelope-open' : ''
      }`}
      style={{ backgroundImage: 'linear-gradient(160deg, var(--paper) 0%, var(--paper-dark) 100%)' }}
    >
      {/* Flowers watermarked into the lower corners. */}
      <Sunflower
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rotate-[14deg] opacity-[0.14]"
      />
      <Iris
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -right-10 h-48 w-40 -rotate-6 opacity-[0.16]"
      />

      {/* A thin inset frame for a stationery feel. */}
      <div className="pointer-events-none absolute inset-[6%] rounded-[16px] border border-line/70" />

      {/* The envelope flap and lower fold lines. */}
      <svg
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M0 0 L300 0 L150 104 Z"
          fill="var(--paper-dark)"
          stroke="var(--line)"
          strokeWidth="1.5"
        />
        <path d="M0 0 L300 0 L150 104 Z" fill="none" stroke="var(--sunflower-soft)" strokeWidth="0.75" strokeOpacity="0.6" />
        <path
          d="M0 200 L150 100 L300 200"
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </svg>

      {/* Golden wax seal at the flap's point. */}
      <div className="absolute left-1/2 top-[52%] h-14 w-14 -translate-x-1/2 -translate-y-1/2">
        <WaxSeal className="h-full w-full" />
      </div>

      {/* The address. */}
      <div className="absolute inset-x-0 bottom-[11%] flex flex-col items-center gap-1.5 px-6 text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-muted">for</span>
        <span className="break-words font-serif text-2xl italic leading-tight text-ink sm:text-3xl">
          {name}
        </span>
        <span className="mt-0.5 h-px w-12 bg-sunflower/50" />
      </div>
    </div>
  )
}
