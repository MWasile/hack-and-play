import { useState } from 'react'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

interface MapLegendProps {
  // Availability: disable panel if no center chosen
  disabled?: boolean

  // Core ranges
  analysisRadius: number
  onAnalysisRadiusChange: (n: number) => void
  greenRadius: number
  onGreenRadiusChange: (n: number) => void

  // Base toggles
  analyzeGreen: boolean
  onAnalyzeGreenChange: (b: boolean) => void
  showDistricts: boolean
  onShowDistrictsChange: (b: boolean) => void

  // Advanced overlays
  showTraffic: boolean
  onShowTrafficChange: (b: boolean) => void
  trafficTime: TimeOfDay
  onTrafficTimeChange: (t: TimeOfDay) => void

  showSocialLife: boolean
  onShowSocialLifeChange: (b: boolean) => void
  showDistrictRhythm: boolean
  onShowDistrictRhythmChange: (b: boolean) => void
  showDigitalNoise: boolean
  onShowDigitalNoiseChange: (b: boolean) => void
  showLifeBalance: boolean
  onShowLifeBalanceChange: (b: boolean) => void
  showSocialAvailability: boolean
  onShowSocialAvailabilityChange: (b: boolean) => void
  showSafety: boolean
  onShowSafetyChange: (b: boolean) => void
}

export default function MapLegend(props: MapLegendProps) {
  const {
    disabled,
    analysisRadius, onAnalysisRadiusChange, greenRadius, onGreenRadiusChange,
    analyzeGreen, onAnalyzeGreenChange, showDistricts, onShowDistrictsChange,
    showTraffic, onShowTrafficChange, trafficTime, onTrafficTimeChange,
    showSocialLife, onShowSocialLifeChange,
    showDistrictRhythm, onShowDistrictRhythmChange,
    showDigitalNoise, onShowDigitalNoiseChange,
    showLifeBalance, onShowLifeBalanceChange,
    showSocialAvailability, onShowSocialAvailabilityChange,
    showSafety, onShowSafetyChange,
  } = props

  const [open, setOpen] = useState(false)

  return (
    <div className="legend-wrapper" aria-hidden={disabled ? true : undefined}>
      <button
        type="button"
        className={"legend-toggle" + (open ? " open" : "")}
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Zwiń legendę' : 'Pokaż legendę'}
        disabled={disabled}
      >
        <span className="legend-toggle-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="legend-toggle-label">Legenda</span>
      </button>

      <div className={"legend-panel" + (open ? " open" : "")} role="dialog" aria-label="Legenda mapy">
        <div className="legend-section">
          <div className="legend-title">Zasięg analiz</div>
          <label className="legend-field">
            <span>🔬 Ogólny (m)</span>
            <input type="range" min={500} max={8000} step={100} value={analysisRadius} onChange={(e) => onAnalysisRadiusChange(Number(e.target.value))} />
            <span className="legend-hint">{analysisRadius} m</span>
          </label>
          <label className="legend-field">
            <span>🌳 Zieleń (m)</span>
            <input type="range" min={200} max={5000} step={100} value={greenRadius} onChange={(e) => onGreenRadiusChange(Number(e.target.value))} />
            <span className="legend-hint">{greenRadius} m</span>
          </label>
          {/* Visual key for analysis range (dashed circle) */}
          <div className="legend-checkbox" aria-hidden>
            <span />
            <span className="legend-chip" style={{ background: 'transparent', boxShadow: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="10" cy="10" r="7" fill="none" stroke="var(--accent-work)" strokeWidth="2" strokeDasharray="4 3" />
              </svg>
            </span>
            <span>🔵 Zasięg analiz na mapie ({analysisRadius} m)</span>
          </div>
        </div>

        <div className="legend-section">
          <div className="legend-title">Warstwy</div>
          <label className="legend-checkbox">
            <input type="checkbox" checked={analyzeGreen} onChange={(e) => onAnalyzeGreenChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-green-fill)' }} />
            <span>🌳 Zielone miejsca</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showDistricts} onChange={(e) => onShowDistrictsChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'linear-gradient(90deg, var(--chip-heat-1), var(--chip-heat-2), var(--chip-heat-3), var(--chip-heat-4), var(--chip-heat-5), var(--chip-heat-6))' }} />
            <span>🗺️ Dzielnice</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showTraffic} onChange={(e) => onShowTrafficChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-home)' }} />
            <span>🚦 Ruch miejski</span>
          </label>
          {showTraffic && (
            <div className="legend-field">
              <select value={trafficTime} onChange={(e) => onTrafficTimeChange(e.target.value as TimeOfDay)}>
                <option value="morning">Rano</option>
                <option value="afternoon">Południe</option>
                <option value="evening">Wieczór</option>
              </select>
            </div>
          )}
          <label className="legend-checkbox">
            <input type="checkbox" checked={showSocialLife} onChange={(e) => onShowSocialLifeChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-magenta)' }} />
            <span>🎉 Życie społeczne</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showDistrictRhythm} onChange={(e) => onShowDistrictRhythmChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-sky)' }} />
            <span>🏘️ Rytm dzielnicy</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showDigitalNoise} onChange={(e) => onShowDigitalNoiseChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-deep-purple)' }} />
            <span>📶 Cyfrowy hałas</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showLifeBalance} onChange={(e) => onShowLifeBalanceChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-orange)' }} />
            <span>⚖️ Life Balance</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showSocialAvailability} onChange={(e) => onShowSocialAvailabilityChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-cyan)' }} />
            <span>🤝 Dostępność społeczna</span>
          </label>
          <label className="legend-checkbox">
            <input type="checkbox" checked={showSafety} onChange={(e) => onShowSafetyChange(e.target.checked)} />
            <span className="legend-chip" style={{ background: 'var(--accent-home)' }} />
            <span>🛡️ Bezpieczeństwo</span>
          </label>
        </div>

        <div className="legend-actions">
          <button type="button" className="btn" onClick={() => {
            onShowTrafficChange(false)
            onShowSocialLifeChange(false)
            onShowDistrictRhythmChange(false)
            onShowDigitalNoiseChange(false)
            onShowLifeBalanceChange(false)
            onShowSocialAvailabilityChange(false)
            onShowSafetyChange(false)
          }}>Wyłącz wszystko</button>
        </div>
      </div>
    </div>
  )
}
