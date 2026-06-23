type IconProps = { className?: string }

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 5.5 19 12 8 18.5 Z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function PauseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <line x1="9" y1="6" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="18" />
    </Svg>
  )
}

export function NextIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 6 15 12 7 18 Z" fill="currentColor" stroke="none" />
      <line x1="17" y1="6" x2="17" y2="18" />
    </Svg>
  )
}

export function RestartIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M17 18 9 12 17 6 Z" fill="currentColor" stroke="none" />
      <line x1="7" y1="6" x2="7" y2="18" />
    </Svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </Svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  )
}
