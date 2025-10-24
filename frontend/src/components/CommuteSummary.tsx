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

function colorByMins(mins: number): string {
  if (mins < 20) return '#4caf50' // green
  if (mins <= 40) return '#ffd54f' // yellow
  return '#e53935' // red
}

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
                <span className="title">{primaryShowsWork ? 'Czas dojazdu do pracy' : 'Czas dojazdu do HOME'}</span>
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

        <div className="sub">Porównanie dojazdu (SPOT → WORK i SPOT → HOME)</div>

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
              const workColor = '#1e88e5'
              const homeColor = '#e53935'
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
                    <span className="dot" aria-hidden style={{ backgroundColor: colorByMins(Number.isFinite(c.mins) ? (c.mins as number) : ((c.homeMins as number) || 0)), boxShadow: `0 0 10px ${colorByMins(Number.isFinite(c.mins) ? (c.mins as number) : ((c.homeMins as number) || 0))}` }} />
                    <span className="label-text" title={c.label}>{displayLabel}</span>
                  </div>

                  <div className="bar-track bar-dual">
                    {Number.isFinite(c.mins) && (
                      <motion.div
                        className="bar-fill mini work"
                        style={{ background: workColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${workWidth}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + idx * 0.04 }}
                      />
                    )}
                    {Number.isFinite(c.homeMins ?? NaN) && (
                      <motion.div
                        className="bar-fill mini home"
                        style={{ background: homeColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${homeWidth}%` }}
                        transition={{ duration: 0.5, delay: 0.12 + idx * 0.04 }}
                      />
                    )}

                    <div className="bar-dual-values">
                      {Number.isFinite(c.mins) && <span className="badge badge-work">WORK ~{formatMins(c.mins)}</span>}
                      {Number.isFinite(c.homeMins ?? NaN) && <span className="badge badge-home">HOME ~{formatMins(c.homeMins as number)}</span>}
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
