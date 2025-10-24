export function getCssVar(name: string, fallback?: string): string {
  if (typeof document === 'undefined') return fallback ?? ''
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return v?.trim() || (fallback ?? '')
}

export const themeColors = {
  accentHome: () => getCssVar('--accent-home', '#e53935'),
  accentWork: () => getCssVar('--accent-work', '#5dc806'),
  accentFrequent: () => getCssVar('--accent-frequent', '#243aaa'),
  accentGreen: () => getCssVar('--accent-green', '#2e7d32'),
  accentGreenFill: () => getCssVar('--accent-green-fill', '#66bb6a'),
  accentIso: () => getCssVar('--accent-iso', '#ff6f00'),
  neutralWhite: () => getCssVar('--neutral-100', '#ffffff'),
  // Additional accents (aligned to theme.css)
  accentMagenta: () => getCssVar('--accent-magenta', '#f472b6'),
  accentViolet: () => getCssVar('--accent-violet', '#8b5cf6'),
  accentSky: () => getCssVar('--accent-sky', '#60a5fa'),
  accentDeepPurple: () => getCssVar('--accent-deep-purple', '#4f46e5'),
  accentOrange: () => getCssVar('--accent-orange', '#f59e0b'),
  accentCyan: () => getCssVar('--accent-cyan', '#06b6d4'),
  // Status
  statusGood: () => getCssVar('--status-good', '#16a34a'),
  statusMedium: () => getCssVar('--status-medium', '#f59e0b'),
  statusBad: () => getCssVar('--status-bad', '#ef4444'),
  // District fallbacks
  districtFallbackStroke: () => getCssVar('--district-fallback-stroke', '#6b7280'),
  districtFallbackFill: () => getCssVar('--district-fallback-fill', 'rgba(156,163,175,0.25)'),
  // Rhythm categories
  rhythmOffice: () => getCssVar('--rhythm-office', '#60a5fa'),
  rhythmFamily: () => getCssVar('--rhythm-family', '#a855f7'),
  rhythmOther: () => getCssVar('--rhythm-other', '#8d6e63'),
  // Digital noise ramp
  noiseLow: () => getCssVar('--noise-low', '#4f46e5'),
  noiseMid: () => getCssVar('--noise-mid', '#a78bfa'),
  noiseHigh: () => getCssVar('--noise-high', '#f472b6'),
  // Life balance ramp
  balanceLow: () => getCssVar('--balance-low', '#81c784'),
  balanceMid: () => getCssVar('--balance-mid', '#fef08a'),
  balanceHigh: () => getCssVar('--balance-high', '#f59e0b'),
  // Social availability ramp
  availabilityLow: () => getCssVar('--availability-low', '#4dd0e1'),
  availabilityMid: () => getCssVar('--availability-mid', '#80cbc4'),
  availabilityHigh: () => getCssVar('--availability-high', '#06b6d4'),
  // Neutral dark
  neutralBlack: () => getCssVar('--neutral-900', '#111827'),

  get: (name: string, fallback?: string) => getCssVar(name, fallback),
}
