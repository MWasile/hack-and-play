import AddressAutocomplete from './AddressAutocomplete'
import { AccordionItem } from './Accordion'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { IconCar, IconTransit, IconBike, IconWalk } from './ModeIcons'

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
    streetQuery, onStreetQueryChange, highlightedStreets, onAddStreet, onRemoveHighlightedStreet,
  } = props

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

  return (
    <aside className="sidebar glass purple">
      <h2 className="title">🔎 Wyszukaj lokalizację</h2>

      {/* Base address card */}
      <div className="section card soft">
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
              <button onClick={onFrequentSearch} className={"btn block" + (isFrequentSearching ? ' loading' : '')} disabled={!!isFrequentSearching} aria-busy={!!isFrequentSearching}>
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
                placeholder="np. Puławska"
                value={streetQuery}
                onChange={(e) => onStreetQueryChange(e.target.value)}
              />
              <button className="btn" onClick={onAddStreet}>Dodaj ulicę</button>
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
    </aside>
  )
}
