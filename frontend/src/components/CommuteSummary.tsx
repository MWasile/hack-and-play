import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCar, IconTransit, IconBike, IconWalk } from './ModeIcons'

export type Comparison = { label: string; mins: number; distanceMeters?: number; homeMins?: number; homeDistanceMeters?: number }

type Props = {
  commuteMode: 'car' | 'transit' | 'bike' | 'walk'
  comparisons: Comparison[]
  comparisonsLoading?: boolean
  // Optional fallback text when detailed comparison isn't available
  commuteInfo?: string
}

function ModeBadge({ mode }: { mode: Props['commuteMode'] }) {
  const label = mode === 'car' ? 'Samochód' : mode === 'transit' ? 'Komunikacja' : mode === 'bike' ? 'Rower' : 'Pieszo'
  const Icon = mode === 'car' ? IconCar : mode === 'transit' ? IconTransit : mode === 'bike' ? IconBike : IconWalk
  return (
    <span className={`mode-badge mode-${mode}`} aria-label={label} title={label}>
      <Icon /> {label}
    </span>
  )
}

function formatMins(mins: number): string {
  const m = Math.max(0, Math.round(mins))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h > 0) return r > 0 ? `${h}h ${r} min` : `${h}h`
  return `${m} min`
}

function CountUp({ to, duration = 800, format = formatMins }: { to: number; duration?: number; format?: (n: number) => string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setVal(Math.round(to * p))
      if (p < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <span>{format(val)}</span>
}

// Helper: tiny badge style for header WORK/HOME indicator
const headerBadgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '2px 8px',
  marginLeft: 8,
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 900,
  letterSpacing: '.4px',
  color: 'var(--neutral-100)',
  boxShadow: '0 6px 14px rgba(var(--shadow-rgb), .08), inset 0 0 0 1px rgba(var(--neutral-100-rgb), .08)'
}

function colorByMins(mins: number): string {
  if (mins < 20) return 'var(--status-good)'
  if (mins <= 40) return 'var(--status-medium)'
  return 'var(--status-bad)'
}

// Inline fallback styles to ensure bars render even if CSS is overridden
const trackStyleBase = {
  position: 'relative',
  height: 48,
  borderRadius: 15,
  background: 'rgba(var(--surface-1-rgb), .6)',
  border: '1px solid var(--glass-border)',
  overflow: 'hidden',
  width: '100%',
  padding: '4px 6px'
} as const

const barFillMiniBase = {
  position: 'absolute' as const,
  left: 0,
  height: 10,
  borderRadius: 999,
  boxShadow: 'inset 0 0 0 1px rgba(var(--neutral-100-rgb), .08), 0 4px 10px rgba(var(--shadow-rgb), .15)'
}

const dualValuesStyle = {
  position: 'absolute' as const,
  inset: 0,
  display: 'flex',
  marginTop: 20,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  pointerEvents: 'none' as const
}

const dotBaseStyle = { width: 10, height: 10, borderRadius: 999 } as const

const badgeBaseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: '0.8rem',
  fontWeight: 900 as const,
  letterSpacing: '.3px',
  boxShadow: '0 6px 14px rgba(var(--shadow-rgb), .08), inset 0 0 0 1px rgba(var(--neutral-100-rgb), .08)',
  WebkitBackdropFilter: 'blur(6px) saturate(130%)',
  backdropFilter: 'blur(6px) saturate(130%)'
} as const

export default function CommuteSummary({ commuteMode, comparisons, comparisonsLoading, commuteInfo }: Props) {
  // Prepare sorted data: by smallest total (WORK + HOME) minutes; complete entries first
  const sorted = useMemo(() => {
    const rows = (comparisons || [])
      .filter(c => Number.isFinite(c.mins) || Number.isFinite(c.homeMins ?? NaN))
      .slice()

    const key = (c: Comparison) => {
      const hasWork = Number.isFinite(c.mins)
      const hasHome = Number.isFinite(c.homeMins ?? NaN)
      const total = (hasWork ? (c.mins as number) : 0) + (hasHome ? (c.homeMins as number) : 0)
      const single = hasWork ? (c.mins as number) : (hasHome ? (c.homeMins as number) : Infinity)
      return { complete: hasWork && hasHome, total: hasWork && hasHome ? total : Infinity, single }
    }

    rows.sort((a, b) => {
      const ka = key(a)
      const kb = key(b)
      if (ka.complete !== kb.complete) return ka.complete ? -1 : 1
      if (ka.total !== kb.total) return (ka.total as number) - (kb.total as number)
      return ka.single - kb.single
    })
    return rows
  }, [comparisons])

  const primary = useMemo(() => (sorted.length ? sorted[0] : null), [sorted])
  const primaryShowsWork = useMemo(() => (primary ? Number.isFinite(primary.mins) : false), [primary])

  // Use one global max across all times for consistent scaling of bars
  const maxOverall = useMemo(() => {
    const vals: number[] = []
    for (const c of sorted) {
      if (Number.isFinite(c.mins)) vals.push(c.mins as number)
      if (Number.isFinite(c.homeMins ?? NaN)) vals.push(c.homeMins as number)
    }
    return vals.length ? Math.max(...vals) : 0
  }, [sorted])

  const showComparison = sorted.length > 0
  const showFallback = !showComparison && !!commuteInfo

  const shouldNumber = sorted.length > 1

  if (!showComparison && !showFallback && !comparisonsLoading) return null

  return (
    <motion.section
      className="commute-summary"
      aria-live="polite"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div className="commute-card pulse-glow" layout>
        <div className="commute-header">
          <div className="headline">
            {primary ? (
              <>
                <span className="title">
                  {primaryShowsWork ? 'Czas dojazdu do pracy' : 'Czas dojazdu do HOME'}
                  <span
                    className={primaryShowsWork ? 'target-badge-work' : 'target-badge-home'}
                    style={{
                      ...headerBadgeBase,
                      background: primaryShowsWork ? 'var(--accent-work)' : 'var(--accent-home)'
                    }}
                  >
                    {primaryShowsWork ? 'WORK' : 'HOME'}
                  </span>
                </span>
                <div className="value big">
                  <CountUp to={primaryShowsWork ? (primary.mins) : ((primary.homeMins as number) || 0)} />
                </div>
              </>
            ) : (
              <>
                <span className="title">Czas dojazdu</span>
                <div className="value big">{commuteInfo}</div>
              </>
            )}
          </div>
          <ModeBadge mode={commuteMode} />
        </div>

        <div className="sub mt-10">Porównanie dojazdu (SPOT → WORK i SPOT → HOME)</div>

        <AnimatePresence initial={false}>
          {comparisonsLoading && (
            <motion.div className="loading" key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="spinner" aria-hidden>⏳</span>
              <span>Liczenie tras…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {showComparison && (
          <div className="bars" role="list">
            {sorted.map((c, idx) => {
              // Colors aligned to badges: WORK (blue), HOME (red)
              const workColor = 'var(--accent-work)'
              const homeColor = 'var(--accent-home)'
              const active = primary && c.label === primary.label && idx === 0

              // Consistent scaling across all bars; no minimum width clamp
              const workWidth = Number.isFinite(c.mins) && maxOverall ? Math.round(((c.mins) as number / maxOverall) * 100) : 0
              const homeWidth = Number.isFinite(c.homeMins ?? NaN) && maxOverall ? Math.round(((c.homeMins as number) / maxOverall) * 100) : 0

              const kmWork = Number.isFinite(c.distanceMeters ?? NaN) ? ((c.distanceMeters as number) / 1000) : NaN
              const kmHome = Number.isFinite(c.homeDistanceMeters ?? NaN) ? ((c.homeDistanceMeters as number) / 1000) : NaN

              const tooltipParts: string[] = []
              if (Number.isFinite(c.mins)) tooltipParts.push(`WORK: ${formatMins(c.mins)}${Number.isFinite(kmWork) ? ` • ${kmWork.toFixed(kmWork < 10 ? 1 : 0)} km` : ''}`)
              if (Number.isFinite(c.homeMins ?? NaN)) tooltipParts.push(`HOME: ${formatMins(c.homeMins as number)}${Number.isFinite(kmHome) ? ` • ${kmHome.toFixed(kmHome < 10 ? 1 : 0)} km` : ''}`)
              const tooltip = `${c.label} • ${tooltipParts.join('  |  ')} • ${commuteMode}`

              const displayLabel = shouldNumber ? `SPOT ${idx + 1} — ${c.label}` : c.label

              return (
                <motion.div
                  className={`bar-row ${active ? 'active' : ''}`}
                  role="listitem"
                  key={`${c.label}-${idx}`}
                  title={tooltip}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="bar-label">
                    <span
                      className="dot"
                      aria-hidden
                      style={{ ...dotBaseStyle, backgroundColor: colorByMins(Number.isFinite(c.mins) ? (c.mins as number) : ((c.homeMins as number) || 0)), boxShadow: `0 0 6px ${colorByMins(Number.isFinite(c.mins) ? (c.mins as number) : ((c.homeMins as number) || 0))}` }}
                    />
                    <span className="label-text" title={c.label}>{displayLabel}</span>
                  </div>

                  <div className="bar-track bar-dual" style={trackStyleBase}>
                    {Number.isFinite(c.mins) && (
                      <motion.div
                        className="bar-fill mini work"
                        style={{ ...barFillMiniBase, top: 0, background: workColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${workWidth}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + idx * 0.04 }}
                      />
                    )}
                    {Number.isFinite(c.homeMins ?? NaN) && (
                      <motion.div
                        className="bar-fill mini home"
                        style={{ ...barFillMiniBase, top: 10, background: homeColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${homeWidth}%` }}
                        transition={{ duration: 0.5, delay: 0.12 + idx * 0.04 }}
                      />
                    )}

                    <div className="bar-dual-values" style={dualValuesStyle}>
                      {Number.isFinite(c.mins) && (
                        <span
                          className="badge badge-work"
                          style={{
                            ...badgeBaseStyle,
                            color: 'var(--neutral-100)',
                            background: 'var(--accent-work)',
                            border: '1px solid rgba(var(--neutral-100-rgb), .12)'
                          }}
                        >
                          WORK ~{formatMins(c.mins)}
                        </span>
                      )}
                      {Number.isFinite(c.homeMins ?? NaN) && (
                        <span
                          className="badge badge-home"
                          style={{
                            ...badgeBaseStyle,
                            color: 'var(--neutral-100)',
                            background: 'var(--accent-home)',
                            border: '1px solid rgba(var(--neutral-100-rgb), .12)'
                          }}
                        >
                          HOME ~{formatMins(c.homeMins as number)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.section>
  )
}
