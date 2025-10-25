import AddressAutocomplete from './AddressAutocomplete'
import { AccordionItem } from './Accordion'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { IconCar, IconTransit, IconBike, IconWalk } from './ModeIcons'
import InsightsChart from './InsightsChart'

export type Suggestion = { lat: number; lng: number; label: string }

export type HighlightedStreet = { name: string; data: any }

// Inline icons removed in favor of shared ModeIcons

interface Props {
  // Address inputs
  homeQuery: string
  onHomeQueryChange: (v: string) => void
  onHomeSelect: (s: Suggestion) => void
  onHomeSearch: () => void
  homeLabel?: string | null

  workQuery: string
  onWorkQueryChange: (v: string) => void
  onWorkSelect: (s: Suggestion) => void
  onWorkSearch: () => void

  frequentQuery: string
  onFrequentQueryChange: (v: string) => void
  onFrequentSelect: (s: Suggestion) => void
  onFrequentSearch: () => void
  frequentLocations?: Array<{ lat: number; lng: number; label?: string | null }>
  onRemoveFrequent?: (index: number) => void
  onReorderFrequent?: (from: number, to: number) => void
  isHomeSearching?: boolean
  isWorkSearching?: boolean
  isFrequentSearching?: boolean

  // Filters
  analyzeCommute: boolean
  onAnalyzeCommuteChange: (b: boolean) => void
  commuteMode: 'car' | 'transit' | 'bike' | 'walk'
  onCommuteModeChange: (m: 'car' | 'transit' | 'bike' | 'walk') => void
  commuteMaxMins: number
  onCommuteMaxMinsChange: (n: number) => void

  considerChild: boolean
  onConsiderChildChange: (b: boolean) => void
  childAge: number | ''
  onChildAgeChange: (v: number | '') => void

  hasPets: boolean
  onHasPetsChange: (b: boolean) => void

  // District selection
  showDistricts: boolean
  districtNames: string[]
  selectedDistricts: string[]
  onToggleDistrict: (name: string, checked: boolean) => void

  // Streets
  streetQuery: string
  onStreetQueryChange: (v: string) => void
  highlightedStreets: HighlightedStreet[]
  onAddStreet: () => void
  onRemoveHighlightedStreet: (name: string) => void
  onAddStreets?: (names: string[]) => void

  // Info
  commuteInfo?: string
  comparisons?: Array<{ label: string; mins: number; distanceMeters?: number }>
  comparisonsLoading?: boolean
}

export default function Sidebar(props: Props) {
  const {
    homeQuery, onHomeQueryChange, onHomeSelect, onHomeSearch, homeLabel,
    workQuery, onWorkQueryChange, onWorkSelect, onWorkSearch,
    frequentQuery, onFrequentQueryChange, onFrequentSelect, onFrequentSearch, frequentLocations = [], onRemoveFrequent, onReorderFrequent,
    isHomeSearching, isWorkSearching, isFrequentSearching,
    analyzeCommute, onAnalyzeCommuteChange, commuteMode, onCommuteModeChange, commuteMaxMins, onCommuteMaxMinsChange,
    considerChild, onConsiderChildChange, childAge, onChildAgeChange,
    hasPets, onHasPetsChange,
    showDistricts, districtNames, selectedDistricts, onToggleDistrict,
    streetQuery, onStreetQueryChange, highlightedStreets, onAddStreet, onRemoveHighlightedStreet, onAddStreets,
  } = props

  const [flipped, setFlipped] = useState(false)
  const optRef = useRef<HTMLDivElement | null>(null)

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, idx: number) {
    e.dataTransfer.setData('text/plain', String(idx))
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>, toIdx: number) {
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    if (!Number.isFinite(from) || from === toIdx) return
    onReorderFrequent?.(from, toIdx)
  }

  // 3D flip styles
  const flipWrapStyle: React.CSSProperties = { perspective: 1100 }
  const flipperStyle: React.CSSProperties = {
    position: 'relative',
    transformStyle: 'preserve-3d',
    minHeight: 200,
  }
  const faceStyle: React.CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    position: 'relative',
  }
  const backStyle: React.CSSProperties = {
    ...faceStyle,
    position: 'absolute',
    inset: 0,
    transform: 'rotateY(180deg)'
  }

  return (
    <aside className="sidebar glass purple">
      <div style={flipWrapStyle}>
        <motion.div
          style={flipperStyle}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* FRONT */}
          <div style={faceStyle}>
            <div className="title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 className="title" style={{ margin: 0 }}>🔎 Wyszukaj lokalizację</h2>
              <button
                type="button"
                className="btn"
                title="Pokaż wskaźniki"
                onClick={() => setFlipped(true)}
                aria-label="Pokaż wskaźniki"
              >
                🔁
              </button>
            </div>

            {/* Base address card */}
            <div className="section card">
              <div className="stack">
                <div className="field">
                  <label className="label">🏠 Adres bazowy</label>
                  <div className="field-row nowrap">
                    <AddressAutocomplete
                      placeholder="np. Marszałkowska 1, Warszawa"
                      value={homeQuery}
                      onChange={onHomeQueryChange}
                      onSelect={onHomeSelect}
                      autoFocus
                    />
                    <button onClick={onHomeSearch} className={"btn primary" + (isHomeSearching ? ' loading' : '')} disabled={!!isHomeSearching} aria-busy={!!isHomeSearching}>
                      {isHomeSearching ? 'Szukam…' : 'Szukaj'}
                    </button>
                  </div>
                </div>
                {homeLabel && (
                  <p className="hint">Wybrana lokalizacja: {homeLabel}</p>
                )}
              </div>
            </div>

            <div ref={optRef}>
              <AccordionItem className="section card" title={<>
                ✚ Opcjonalne
              </>} defaultOpen>
                <div className="stack">
                  <div className="field">
                    <label className="label">💼 Adres Pracy / Uczelni</label>
                    {/* Make input full width; action below */}
                    <AddressAutocomplete
                      placeholder="np. Aleje Jerozolimskie 123, Warszawa"
                      value={workQuery}
                      onChange={onWorkQueryChange}
                      onSelect={onWorkSelect}
                    />
                    <button onClick={onWorkSearch} className={"btn block" + (isWorkSearching ? ' loading' : '')} disabled={!!isWorkSearching} aria-busy={!!isWorkSearching}>
                      {isWorkSearching ? 'Zapisywanie…' : 'Zapisz adres pracy/uczelni'}
                    </button>
                  </div>

                  <div className="field">
                    <label className="label">📍 Często odwiedzana lokalizacja</label>
                    <AddressAutocomplete
                      placeholder="np. dom rodziny, ulubione miejsce"
                      value={frequentQuery}
                      onChange={onFrequentQueryChange}
                      onSelect={onFrequentSelect}
                    />
                    <button onClick={() => { onFrequentSearch(); onFrequentQueryChange('') }} className={"btn block" + (isFrequentSearching ? ' loading' : '')} disabled={!!isFrequentSearching} aria-busy={!!isFrequentSearching}>
                      {isFrequentSearching ? 'Dodaję…' : 'Dodaj lokalizację'}
                    </button>

                    {frequentLocations.length > 0 && (
                      <div className="stack">
                        {frequentLocations.map((f, idx) => (
                          <div
                            className="chip"
                            key={idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, idx)}
                            title="Przeciągnij, by zmienić kolejność"
                          >
                            <span>{f.label ?? `Lokalizacja #${idx + 1}`}</span>
                            {onRemoveFrequent && (
                              <button className="chip-remove" onClick={() => onRemoveFrequent(idx)}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionItem>
            </div>

            <AccordionItem className="section card" title={<>
              🎛️ Filtry
            </>} defaultOpen>
              <div className="stack">
                <label className="toggle">
                  <input type="checkbox" checked={analyzeCommute} onChange={(e) => onAnalyzeCommuteChange(e.target.checked)} />
                  <span className="toggle-track" aria-hidden><span className="toggle-thumb" /></span>
                  <span className="toggle-text">⏱️ Analiza czasu dojazdu</span>
                </label>

                {analyzeCommute && (
                  <div className="stack">
                    <div className="mode-group" role="group" aria-label="Wybierz środek transportu">
                      {(['car','transit','bike','walk'] as const).map((m) => {
                        const Icon = m === 'car' ? IconCar : m === 'transit' ? IconTransit : m === 'bike' ? IconBike : IconWalk
                        return (
                          <motion.button
                            key={m}
                            type="button"
                            className={"mode-btn" + (commuteMode === m ? ' active' : '')}
                            onClick={() => onCommuteModeChange(m)}
                            title={{car:'Samochód', transit:'Komunikacja', bike:'Rower', walk:'Pieszo'}[m]}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          >
                            <span className="mode-ico"><Icon width={16} height={16} /></span>
                            <span className="mode-label">{{car:'Samochód', transit:'Komunikacja', bike:'Rower', walk:'Pieszo'}[m]}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                    <div className="time-row">
                      <span className="time-ico">🕒</span>
                      <input
                        className="time-slider"
                        type="range"
                        min={10}
                        max={60}
                        step={5}
                        value={commuteMaxMins}
                        onChange={(e) => onCommuteMaxMinsChange(Number(e.target.value))}
                      />
                      <span className="time-label">max {commuteMaxMins} min</span>
                    </div>
                  </div>
                )}

                <label className="toggle">
                  <input type="checkbox" checked={considerChild} onChange={(e) => onConsiderChildChange(e.target.checked)} />
                  <span className="toggle-track" aria-hidden><span className="toggle-thumb" /></span>
                  <span className="toggle-text">👶 Dziecko</span>
                </label>

                <div className={"reveal" + (considerChild ? ' open' : '')}>
                  {considerChild && (
                    <div className="field">
                      <label className="label">Jaki wiek?</label>
                      <input type="number" min={0} max={18} value={childAge} onChange={(e) => onChildAgeChange(e.target.value === '' ? '' : Number(e.target.value))} />
                    </div>
                  )}
                </div>

                <label className="toggle">
                  <input type="checkbox" checked={hasPets} onChange={(e) => onHasPetsChange(e.target.checked)} />
                  <span className="toggle-track" aria-hidden><span className="toggle-thumb" /></span>
                  <span className="toggle-text">🐾 Zwierzęta</span>
                </label>

                {showDistricts && (
                  <div className="field">
                    <label className="label">Wybierz dzielnice do wyróżnienia</label>
                    <div className="district-list">
                      {districtNames.length ? (
                        districtNames.map((name) => (
                          <label className="checkbox left" key={name}>
                            <input
                              type="checkbox"
                              checked={selectedDistricts.includes(name)}
                              onChange={(e) => onToggleDistrict(name, e.target.checked)}
                            />
                            <span>{name}</span>
                          </label>
                        ))
                      ) : (
                        <div className="hint small">Ładowanie dzielnic…</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="field">
                  <label className="label">🚦 Wyróżnij ulicę (Warszawa)</label>
                  <div className="field-row nowrap">
                    <input
                      placeholder="np. Puławska, Marszałkowska (możesz wkleić wiele wierszy lub rozdzielić przecinkami)"
                      value={streetQuery}
                      onChange={(e) => onStreetQueryChange(e.target.value)}
                    />
                    <button
                      className="btn"
                      onClick={() => {
                        const names = streetQuery
                          .split(/[\n,;]+/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                        if (names.length === 0) return
                        if (onAddStreets) onAddStreets(names)
                        else if (onAddStreet) {
                          // Fallback: add the first
                          onAddStreet()
                        }
                        onStreetQueryChange('')
                      }}
                    >
                      Dodaj ulicę/ulice
                    </button>
                  </div>
                  {highlightedStreets.length > 0 && (
                    <div className="stack">
                      {highlightedStreets.map((s) => (
                        <div className="chip" key={s.name}>
                          <span>{s.name}</span>
                          <button className="chip-remove" onClick={() => onRemoveHighlightedStreet(s.name)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AccordionItem>
          </div>

          {/* BACK */}
          <div style={backStyle}>
            <div className="title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 className="title" style={{ margin: 0 }}>📊 Wskaźniki</h2>
              <button
                type="button"
                className="btn"
                title="Wróć do wyszukiwania"
                onClick={() => setFlipped(false)}
                aria-label="Wróć"
              >
                🔁
              </button>
            </div>
            <div className="section card">
              <div className="stack">
                <p className="hint">Prezentacja wskaźników dla okolicy (mockowane dane):</p>
                <InsightsChart />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </aside>
  )
}
