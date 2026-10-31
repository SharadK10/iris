import IrisHead from './botanical/IrisHead'

/**
 * A golden wax seal stamped with the iris. The disc is a warm gold gradient
 * with inner highlight/shadow to read as poured wax; the stamp sits darker in it.
 */
export default function WaxSeal({ className }: { className?: string }) {
  return (
    <div
      className={`seal-pulse relative rounded-full ${className ?? ''}`}
      data-seal
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
      {/* The iris pressed into the wax. */}
      <IrisHead variant="stamp" className="absolute inset-0 h-full w-full p-[22%] opacity-70" />
    </div>
  )
}
