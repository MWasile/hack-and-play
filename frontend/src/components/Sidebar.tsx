import AddressAutocomplete from './AddressAutocomplete'

export type Suggestion = { lat: number; lng: number; label: string }

export type HighlightedStreet = { name: string; data: any }

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

  analyzeGreen: boolean
  onAnalyzeGreenChange: (b: boolean) => void
  greenRadius: number
  onGreenRadiusChange: (n: number) => void

  showDistricts: boolean
  onShowDistrictsChange: (b: boolean) => void
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
}

export default function Sidebar(props: Props) {
  const {
    homeQuery, onHomeQueryChange, onHomeSelect, onHomeSearch, homeLabel,
    workQuery, onWorkQueryChange, onWorkSelect, onWorkSearch,
    frequentQuery, onFrequentQueryChange, onFrequentSelect, onFrequentSearch,
    analyzeCommute, onAnalyzeCommuteChange, commuteMode, onCommuteModeChange, commuteMaxMins, onCommuteMaxMinsChange,
    considerChild, onConsiderChildChange, childAge, onChildAgeChange,
    hasPets, onHasPetsChange,
    analyzeGreen, onAnalyzeGreenChange, greenRadius, onGreenRadiusChange,
    showDistricts, onShowDistrictsChange, districtNames, selectedDistricts, onToggleDistrict,
    streetQuery, onStreetQueryChange, highlightedStreets, onAddStreet, onRemoveHighlightedStreet,
    commuteInfo,
  } = props

  return (
    <aside className="sidebar glass purple">
      <h2 className="title">🔎 Wyszukaj lokalizację</h2>
      <div className="stack">
        <div className="field">
          <label className="label">🏠 Adres bazowy</label>
          <div className="field-row nowrap">
            <AddressAutocomplete
              placeholder="np. Marszałkowska 1, Warszawa"
              value={homeQuery}
              onChange={onHomeQueryChange}
              onSelect={onHomeSelect}
            />
            <button onClick={onHomeSearch} className="btn primary">Szukaj</button>
          </div>
        </div>
        {homeLabel && (
          <p className="hint">Wybrana lokalizacja: {homeLabel}</p>
        )}
      </div>

      <details className="section" open>
        <summary>➕ Opcjonalne</summary>
        <div className="stack">
          <div className="field">
            <label className="label">💼 Adres Pracy / Uczelni</label>
            <div className="field-row nowrap">
              <AddressAutocomplete
                placeholder="np. Aleje Jerozolimskie 123, Warszawa"
                value={workQuery}
                onChange={onWorkQueryChange}
                onSelect={onWorkSelect}
              />
              <button onClick={onWorkSearch} className="btn">Dodaj</button>
            </div>
          </div>

          <div className="field">
            <label className="label">📍 Często odwiedzana lokalizacja</label>
            <div className="field-row nowrap">
              <AddressAutocomplete
                placeholder="np. dom rodziny, ulubione miejsce"
                value={frequentQuery}
                onChange={onFrequentQueryChange}
                onSelect={onFrequentSelect}
              />
              <button onClick={onFrequentSearch} className="btn">Dodaj</button>
            </div>
          </div>
        </div>
      </details>

      <details className="section" open>
        <summary>🎛️ Filtry</summary>
        <div className="stack">
          <label className="checkbox left">
            <input type="checkbox" checked={analyzeCommute} onChange={(e) => onAnalyzeCommuteChange(e.target.checked)} />
            <span>⏱️ Analiza czasu dojazdu</span>
          </label>
          {analyzeCommute && (
            <div className="grid-2">
              <div>
                <label className="label">Tryb</label>
                <select value={commuteMode} onChange={(e) => onCommuteModeChange(e.target.value as any)}>
                  <option value="car">Samochód</option>
                  <option value="transit">Komunikacja</option>
                  <option value="bike">Rower</option>
                  <option value="walk">Pieszo</option>
                </select>
              </div>
              <div>
                <label className="label">Maks. czas (min)</label>
                <input type="number" min={5} max={120} value={commuteMaxMins} onChange={(e) => onCommuteMaxMinsChange(Number(e.target.value))} />
              </div>
            </div>
          )}

          <label className="checkbox left">
            <input type="checkbox" checked={considerChild} onChange={(e) => onConsiderChildChange(e.target.checked)} />
            <span>👶 Czy uwzględnić dziecko?</span>
          </label>
          {considerChild && (
            <div className="field">
              <label className="label">Jaki wiek?</label>
              <input type="number" min={0} max={18} value={childAge} onChange={(e) => onChildAgeChange(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          )}

          <label className="checkbox left">
            <input type="checkbox" checked={hasPets} onChange={(e) => onHasPetsChange(e.target.checked)} />
            <span>🐾 Zwierzęta</span>
          </label>

          <label className="checkbox left">
            <input type="checkbox" checked={analyzeGreen} onChange={(e) => onAnalyzeGreenChange(e.target.checked)} />
            <span>🌳 Analiza "zielonych miejsc" w okolicy</span>
          </label>
          {analyzeGreen && (
            <div className="field">
              <label className="label">Promień analizy (m)</label>
              <input type="range" min={200} max={5000} step={100} value={greenRadius} onChange={(e) => onGreenRadiusChange(Number(e.target.value))} />
              <div className="hint">{greenRadius} m</div>
            </div>
          )}

          <label className="checkbox left">
            <input type="checkbox" checked={showDistricts} onChange={(e) => onShowDistrictsChange(e.target.checked)} />
            <span>🗺️ Podświetl/Ukryj dzielnice Warszawy</span>
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
              <button className="btn" onClick={onAddStreet}>Dodaj</button>
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
      </details>

      {commuteInfo && <p className="hint">{commuteInfo}</p>}
    </aside>
  )
}

