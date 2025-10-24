// filepath: /Users/kamilzak/hack-and-play-/frontend/src/components/ModeIcons.tsx
import React from 'react'

export function IconCar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={props.width ?? 20} height={props.height ?? 20} viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <rect x="4" y="9" width="16" height="6" rx="2" fill="currentColor" />
      <rect x="6" y="7" width="8" height="3" rx="1" fill="currentColor" />
      <circle cx="8" cy="16" r="2" fill="#111" />
      <circle cx="16" cy="16" r="2" fill="#111" />
    </svg>
  )
}

export function IconTransit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={props.width ?? 20} height={props.height ?? 20} viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <rect x="5" y="5" width="14" height="12" rx="2" fill="currentColor" />
      <rect x="7" y="7" width="10" height="4" rx="1" fill="#111" />
      <circle cx="9" cy="17" r="1.6" fill="#111" />
      <circle cx="15" cy="17" r="1.6" fill="#111" />
    </svg>
  )
}

export function IconBike(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={props.width ?? 20} height={props.height ?? 20} viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <circle cx="7" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M10 16 L12 12 L15 12 L17 16" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconWalk(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={props.width ?? 20} height={props.height ?? 20} viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <path d="M12 7 L10 12 L7 14" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 10 L15 13 L16 18" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

export type CommuteMode = 'car' | 'transit' | 'bike' | 'walk'
export function ModeLabel(mode: CommuteMode): string {
  return mode === 'car' ? 'Samochód' : mode === 'transit' ? 'Komunikacja' : mode === 'bike' ? 'Rower' : 'Pieszo'
}

