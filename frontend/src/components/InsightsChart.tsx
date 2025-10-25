import React, { useMemo } from 'react'
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

// Mocked indicators in percent with icons
// Values 0..100
const MOCK = [
  { key: 'traffic', label: '🚦 Ruch miejski', value: 64.38 },
  { key: 'social', label: '🎉 Życie społeczne', value: 72.15 },
  { key: 'rhythm', label: '🏘️ Rytm dzielnicy', value: 58.27 },
  { key: 'green', label: '🌳 Zielone miejsca', value: 81.92 },
  { key: 'noise', label: '📶 Cyfrowy hałas', value: 33.5 },
  { key: 'balance', label: '⚖️ Life balance', value: 69.02 },
  { key: 'availability', label: '🤝 Dostępność społeczna', value: 55.44 },
  { key: 'safety', label: '🛡️ Bezpieczeństwo', value: 76.8 },
]

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
  return (
    <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,.75)', color: 'white', borderRadius: 6, border: '1px solid rgba(255,255,255,.12)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div>{Number(v).toFixed(2)}%</div>
    </div>
  )
}

export default function InsightsChart() {
  const data = useMemo(() => {
    return MOCK
  }, [])

  return (
    <div style={{ width: '100%', height: 380, marginLeft: -35 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 20, bottom: 8, left: 1 }}
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
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-strong, #111827)', fontSize: 11 }} tickCount={6} unit="%" />
          <YAxis type="category" dataKey="label" width={190} tick={{ fill: 'var(--text-strong, #111827)', fontSize: 12 }} />

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
