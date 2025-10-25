import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  CartesianGrid
} from 'recharts'
import { TrafficCone, Users, Building2, Trees, Wifi, Scale, Handshake, Shield } from 'lucide-react'

// Mocked indicators in percent with Lucide icons mapping
// Values 0..100
const MOCK = [
  { key: 'traffic', value: 64.38 },
  { key: 'social', value: 72.15 },
  { key: 'rhythm', value: 58.27 },
  { key: 'green', value: 81.92 },
  { key: 'noise', value: 33.5 },
  { key: 'balance', value: 69.02 },
  { key: 'availability', value: 55.44 },
  { key: 'safety', value: 76.8 },
] as Array<{ key: keyof typeof LABELS; value: number }>

const LABELS = {
  traffic: { label: 'Ruch miejski', Icon: TrafficCone },
  social: { label: 'Życie społeczne', Icon: Users },
  rhythm: { label: 'Rytm dzielnicy', Icon: Building2 },
  green: { label: 'Zielone miejsca', Icon: Trees },
  noise: { label: 'Cyfrowy hałas', Icon: Wifi },
  balance: { label: 'Life balance', Icon: Scale },
  availability: { label: 'Dostępność społeczna', Icon: Handshake },
  safety: { label: 'Bezpieczeństwo', Icon: Shield },
} as const

const ValueLabel: React.FC<any> = (props) => {
  const { x, y, width, height, value } = props
  if (typeof x !== 'number' || typeof width !== 'number') return null
  // Position label at bar end (right side)
  const tx = x + width + 6
  const ty = (y ?? 0) + (height ?? 0) / 2 + 4
  const text = `${Number(value).toFixed(2)}%`
  return (
    <text x={tx} y={ty} fill="var(--text-strong, #111827)" fontSize={12} textAnchor="start">
      {text}
    </text>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null
  const p = payload.find((d: any) => d.dataKey === 'value')
  const v = p?.value ?? 0
  const name = LABELS[(label as keyof typeof LABELS)]?.label ?? String(label)
  return (
    <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,.75)', color: 'white', borderRadius: 6, border: '1px solid rgba(255,255,255,.12)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
      <div>{Number(v).toFixed(2)}%</div>
    </div>
  )
}

const YTick: React.FC<any> = ({ x, y, payload }) => {
  const k = payload?.value as keyof typeof LABELS
  const meta = LABELS[k]
  if (!meta) return null
  const { Icon, label } = meta
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      {/* Render everything to the left of the axis tick so it doesn't overlap bars */}
      <g transform="translate(-22,-8)">
        <Icon size={16} aria-hidden />
      </g>
      <text x={-27} dy="0.35em" fill="var(--text-strong, #111827)" fontSize={12} textAnchor="end">
        {label}
      </text>
    </g>
  )
}

export type InsightDatum = { key: keyof typeof LABELS; value: number }

export default function InsightsChart({ data: input }: { data?: InsightDatum[] }) {
  const data = useMemo(() => {
    if (Array.isArray(input) && input.length) return input
    return MOCK
  }, [input])
  const reduceMotion = useReducedMotion()

  return (
    <div style={{ width: '100%', height: 380, position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.55)', borderRadius: '10px' }}>
      {/* Subtelna animacja tła symbolizująca "moc" wyników */}
      {!reduceMotion && (
        <>
          {/* Pulsująca poświata gradientowa */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-40% -10% auto -10%',
              height: 240,
              background: 'radial-gradient(60% 60% at 20% 50%, rgba(211,47,47,0.14), transparent 60%), radial-gradient(60% 60% at 50% 50%, rgba(251,192,45,0.10), transparent 60%), radial-gradient(60% 60% at 80% 50%, rgba(46,125,50,0.14), transparent 60%)',
              filter: 'blur(18px)',
              pointerEvents: 'none',
              zIndex: 0
            }}
            initial={{ opacity: 0.25, scale: 0.98 }}
            animate={{ opacity: [0.25, 0.4, 0.25], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Delikatne fale energii w tle */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              pointerEvents: 'none',
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(17,24,39,0.03) 0px, rgba(17,24,39,0.03) 2px, transparent 2px, transparent 10px)'
            }}
            initial={{ backgroundPositionX: 0 }}
            animate={{ backgroundPositionX: ['0%', '100%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}

      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 25, bottom: 8, left: 10 }}
          barCategoryGap={10}
        >
          <defs>
            <linearGradient id="rg-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d32f2f" />
              <stop offset="25%" stopColor="#f57c00" />
              <stop offset="50%" stopColor="#fbc02d" />
              <stop offset="75%" stopColor="#7cb342" />
              <stop offset="100%" stopColor="#2e7d32" />
            </linearGradient>
          </defs>

          <CartesianGrid horizontal vertical={false} stroke="rgba(0,0,0,.08)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-strong, #111827)', fontSize: 14 }} tickCount={6} unit="%" />
          <YAxis
            type="category"
            dataKey="key"
            width={200}
            tick={<YTick />}
          />

          {/* Single gradient bar, wider with rounded corners */}
          <Bar dataKey="value" fill="url(#rg-grad)" barSize={10} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="value" content={<ValueLabel />} />
          </Bar>

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,.04)' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
