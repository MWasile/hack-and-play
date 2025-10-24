import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import MapCanvas, { type CircleSpec, type MarkerSpec } from './components/MapCanvas'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { fetchIsochronesORS, fetchOSRMRoute, fetchOverpassGreenAreas, fetchWarsawDistricts, fetchStreetByNameInWarsaw, fetchNearbyNamedStreets } from './lib/api'
import AddressAutocomplete from './components/AddressAutocomplete'

// Tiny geocoder using OpenStreetMap Nominatim (public demo; keep requests light)
async function geocodeAddress(q: string): Promise<{ lat: number; lng: number; label: string } | null> {
  if (!q.trim()) return null
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', q)

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json'
    }
  })
  if (!res.ok) return null
  const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>
  if (!data?.length) return null
  const first = data[0]
  return { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name }
}

function App() {
  // Addresses
  const [homeQuery, setHomeQuery] = useState('')
  const [workQuery, setWorkQuery] = useState('')
  const [frequentQuery, setFrequentQuery] = useState('')

  // Locations
  const [home, setHome] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [work, setWork] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [frequent, setFrequent] = useState<{ lat: number; lng: number; label?: string } | null>(null)

  // Filters matching the diagram
  const [considerChild, setConsiderChild] = useState(false)
  const [childAge, setChildAge] = useState<number | ''>('')
  const [hasPets, setHasPets] = useState(false)
  const [analyzeGreen, setAnalyzeGreen] = useState(false)
  const [greenRadius, setGreenRadius] = useState(1000) // meters
  const [analyzeCommute, setAnalyzeCommute] = useState(false)
  const [commuteMode, setCommuteMode] = useState<'car' | 'transit' | 'bike' | 'walk'>('car')
  const [commuteMaxMins, setCommuteMaxMins] = useState(30)

  const [commuteInfo, setCommuteInfo] = useState<string>('')
  const [geoLayers, setGeoLayers] = useState<{ id: string; data: FeatureCollection | Feature; style?: any; onEachFeature?: any }[]>([])

  // New: Warsaw districts toggle and selection
  const [showDistricts, setShowDistricts] = useState(false)
  const [warsawDistricts, setWarsawDistricts] = useState<FeatureCollection | null>(null)
  const [districtNames, setDistrictNames] = useState<string[]>([])
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])

  // New: Highlight streets by name
  const [streetQuery, setStreetQuery] = useState('')
  const [highlightedStreets, setHighlightedStreets] = useState<{ name: string; data: FeatureCollection }[]>([])

  // New: Suggestions near home
  const [suggestedDistricts, setSuggestedDistricts] = useState<string[]>([])
  const [suggestedStreets, setSuggestedStreets] = useState<string[]>([])

  // Geocode actions
  const searchHome = useCallback(async () => {
    const res = await geocodeAddress(homeQuery)
    if (res) setHome(res)
  }, [homeQuery])

  const searchWork = useCallback(async () => {
    const res = await geocodeAddress(workQuery)
    if (res) setWork(res)
  }, [workQuery])

  const searchFrequent = useCallback(async () => {
    const res = await geocodeAddress(frequentQuery)
    if (res) setFrequent(res)
  }, [frequentQuery])

  // Map markers from selected locations – show short labels
  const markers: MarkerSpec[] = useMemo(() => {
    const m: MarkerSpec[] = []
    if (home) m.push({ id: 'home', position: home, label: 'HOME', color: '#e53935' })
    if (work) m.push({ id: 'work', position: work, label: 'WORK', color: '#1e88e5' })
    if (frequent) m.push({ id: 'frequent', position: frequent, label: 'SPOT', color: '#8e24aa' })
    return m
  }, [home, work, frequent])

  // Optional green-area circle around home
  const circles: CircleSpec[] = useMemo(() => {
    if (analyzeGreen && home) {
      return [
        {
          id: 'green-radius',
          center: home,
          radiusMeters: greenRadius,
          color: '#2e7d32',
          fillColor: '#66bb6a',
          opacity: 0.8,
          fillOpacity: 0.15,
        },
      ]
    }
    return []
  }, [analyzeGreen, greenRadius, home])

  // Choose map center: prefer home, else work, else frequent
  const mapCenter = home ?? work ?? frequent ?? null

  // Restore preferences on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hp_prefs_v1')
      if (!raw) return
      const p = JSON.parse(raw)
      if (p.home) { setHome(p.home); if (p.home.label) setHomeQuery(p.home.label) }
      if (p.work) { setWork(p.work); if (p.work.label) setWorkQuery(p.work.label) }
      if (p.frequent) { setFrequent(p.frequent); if (p.frequent.label) setFrequentQuery(p.frequent.label) }
      setAnalyzeCommute(!!p.analyzeCommute)
      setCommuteMode(p.commuteMode ?? 'car')
      setCommuteMaxMins(p.commuteMaxMins ?? 30)
      setConsiderChild(!!p.considerChild)
      setChildAge(p.childAge ?? '')
      setHasPets(!!p.hasPets)
      setAnalyzeGreen(!!p.analyzeGreen)
      setGreenRadius(p.greenRadius ?? 1000)
      setShowDistricts(!!p.showDistricts)
      if (Array.isArray(p.selectedDistricts)) setSelectedDistricts(p.selectedDistricts)
    } catch {}
  }, [])

  // Persist preferences when inputs change
  useEffect(() => {
    const prefs = {
      home, work, frequent,
      analyzeCommute, commuteMode, commuteMaxMins,
      considerChild, childAge, hasPets,
      analyzeGreen, greenRadius,
      showDistricts, selectedDistricts,
      highlightedStreetsNames: highlightedStreets.map((s) => s.name),
    }
    localStorage.setItem('hp_prefs_v1', JSON.stringify(prefs))
  }, [home, work, frequent, analyzeCommute, commuteMode, commuteMaxMins, considerChild, childAge, hasPets, analyzeGreen, greenRadius, showDistricts, selectedDistricts, highlightedStreets])

  // Commute analysis: ORS isochrones if key present; otherwise OSRM routing to Work
  useEffect(() => {
    let cancelled = false
    async function run() {
      setCommuteInfo('')
      setGeoLayers((l) => l.filter((x) => !x.id.startsWith('iso'))) // clear old isochrones
      if (!analyzeCommute || !home) return

      // Try ORS isochrones first
      const iso = await fetchIsochronesORS({ lat: home.lat, lng: home.lng }, commuteMode as any, commuteMaxMins * 60)
      if (!cancelled && iso) {
        setGeoLayers((prev) => [
          ...prev,
          { id: 'isochrones', data: iso, style: { color: '#ff6f00', weight: 2, fillOpacity: 0.15 } },
        ])
        setCommuteInfo(`Strefa dojazdu ~${commuteMaxMins} min (${commuteMode}).`)
        return
      }

      // Fallback: route to Work via OSRM
      if (work) {
        const res = await fetchOSRMRoute({ lat: home.lat, lng: home.lng }, { lat: work.lat, lng: work.lng }, commuteMode as any)
        if (!cancelled && res) {
          setGeoLayers((prev) => [
            ...prev,
            { id: 'route', data: res.feature, style: { color: '#1e88e5', weight: 4, opacity: 0.9 } },
          ])
          setCommuteInfo(`Czas dojazdu do pracy: ~${Math.round(res.durationSec / 60)} min (${commuteMode}).`)
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [analyzeCommute, home, work, commuteMode, commuteMaxMins])

  // Green areas via Overpass
  useEffect(() => {
    let cancelled = false
    async function run() {
      setGeoLayers((l) => l.filter((x) => !x.id.startsWith('parks')))
      if (!analyzeGreen || !home) return
      const fc = await fetchOverpassGreenAreas({ lat: home.lat, lng: home.lng }, greenRadius)
      if (!cancelled && fc) {
        setGeoLayers((prev) => [
          ...prev,
          { id: 'parks', data: fc, style: { color: '#2e7d32', weight: 1, fillColor: '#66bb6a', fillOpacity: 0.2 } },
        ])
      }
    }
    run()
    return () => { cancelled = true }
  }, [analyzeGreen, home, greenRadius])

  // Load Warsaw districts when toggled on
  useEffect(() => {
    let cancelled = false
    async function run() {
      setGeoLayers((l) => l.filter((x) => !x.id.startsWith('warsaw-district')))
      if (!showDistricts) return
      if (!warsawDistricts) {
        const fc = await fetchWarsawDistricts()
        if (cancelled) return
        if (fc) {
          setWarsawDistricts(fc)
          const names = (fc.features || [])
            .map((f: any) => f.properties?.name || f.properties?.tags?.name)
            .filter(Boolean) as string[]
          const uniqueNames = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, 'pl'))
          setDistrictNames(uniqueNames)
          // Default: highlight all when first enabling (if no prior selection restored)
          setSelectedDistricts((prev) => (prev && prev.length > 0 ? prev : uniqueNames))
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [showDistricts])

  // When turning ON the districts toggle, select all by default (each time)
  useEffect(() => {
    if (showDistricts && districtNames.length) {
      setSelectedDistricts(districtNames)
    }
  }, [showDistricts])

  // Compute suggested districts when home and districts are available
  useEffect(() => {
    if (!home || !warsawDistricts) { setSuggestedDistricts([]); return }
    function featureCenter(f: any): { lat: number; lng: number } | null {
      const g = f.geometry as Geometry | undefined
      if (!g) return null
      let minLat = 90, minLng = 180, maxLat = -90, maxLng = -180
      function scanCoords(coords: any) {
        if (typeof coords[0] === 'number') {
          const [lng, lat] = coords as [number, number]
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
          if (lng < minLng) minLng = lng
          if (lng > maxLng) maxLng = lng
        } else {
          for (const c of coords) scanCoords(c)
        }
      }
      scanCoords((g as any).coordinates)
      if (minLat === 90) return null
      return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 }
    }
    const withDist: Array<{ name: string; d2: number }> = []
    for (const f of warsawDistricts.features as any[]) {
      const name = f.properties?.name || f.properties?.tags?.name
      if (!name) continue
      const c = featureCenter(f)
      if (!c) continue
      const d2 = (c.lat - home.lat) ** 2 + (c.lng - home.lng) ** 2
      withDist.push({ name, d2 })
    }
    withDist.sort((a, b) => a.d2 - b.d2)
    setSuggestedDistricts(Array.from(new Set(withDist.map((x) => x.name))).slice(0, 5))
  }, [home, warsawDistricts])

  // Suggest streets near home
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!home) { setSuggestedStreets([]); return }
      const fc = await fetchNearbyNamedStreets({ lat: home.lat, lng: home.lng })
      if (cancelled || !fc) { setSuggestedStreets([]); return }
      type F = Feature & { properties: any }
      const candidates: Array<{ name: string; d2: number; highway?: string }> = []
      for (const f of (fc.features || []) as F[]) {
        const name = f.properties?.name || f.properties?.tags?.name
        const hwy = f.properties?.highway || f.properties?.tags?.highway
        if (!name || !hwy) continue
        if (!['primary','secondary','tertiary','residential','living_street','cycleway','trunk'].includes(String(hwy))) continue
        const g = f.geometry as any
        const first = g?.coordinates?.[0]
        const [lng, lat] = Array.isArray(first) && typeof first[0] === 'number' ? first as [number, number] : [home.lng, home.lat]
        const d2 = (lat - home.lat) ** 2 + (lng - home.lng) ** 2
        candidates.push({ name, d2, highway: hwy })
      }
      candidates.sort((a, b) => a.d2 - b.d2)
      const uniq: string[] = []
      const seen = new Set<string>()
      for (const c of candidates) {
        const key = c.name.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        uniq.push(c.name)
        if (uniq.length >= 6) break
      }
      setSuggestedStreets(uniq)
    }
    run()
    return () => { cancelled = true }
  }, [home])

  // New: unique RGB color per district name
  const districtColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    const N = districtNames.length || 1
    function hslToRgb(h: number, s: number, l: number): [number, number, number] {
      s /= 100; l /= 100
      const k = (n: number) => (n + h / 30) % 12
      const a = s * Math.min(l, 1 - l)
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
      return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]
    }
    districtNames.forEach((name, idx) => {
      const hue = Math.round((360 * idx) / N)
      const [r, g, b] = hslToRgb(hue, 70, 55)
      map[name] = `rgb(${r}, ${g}, ${b})`
    })
    return map
  }, [districtNames])

  // Update district layers when data or selection changes
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => !x.id.startsWith('warsaw-district')))
    if (!showDistricts || !warsawDistricts) return

    const outlineLayer = {
      id: 'warsaw-districts-outline',
      data: { type: 'FeatureCollection', features: warsawDistricts.features as any } as FeatureCollection,
      style: { color: '#cdbaff', weight: 1, fillOpacity: 0.03 },
      onEachFeature: (feature: any, layer: any) => {
        const name = feature.properties?.name || feature.properties?.tags?.name || 'Dzielnica'
        layer.bindTooltip(name, { sticky: true, className: 'polygon-tooltip' })
      },
    }

    const selectedSet = new Set(selectedDistricts)
    const selected: FeatureCollection = {
      type: 'FeatureCollection',
      features: (warsawDistricts.features || []).filter((f: any) => selectedSet.has(f.properties?.name || f.properties?.tags?.name)) as any,
    }

    const coloredLayer = {
      id: 'warsaw-districts-colored',
      data: selected,
      style: (feature: any) => {
        const name = feature?.properties?.name || feature?.properties?.tags?.name
        const color = (name && districtColorMap[name]) || '#7a59ff'
        return { color, weight: 2, fillColor: color, fillOpacity: 0.22, opacity: 1 }
      },
      onEachFeature: (feature: any, layer: any) => {
        const name = feature.properties?.name || feature.properties?.tags?.name || 'Dzielnica'
        layer.bindTooltip(`⭐ ${name}`, { sticky: true, className: 'polygon-tooltip' })
        layer.on('mouseover', () => (layer as any).setStyle({ weight: 3, fillOpacity: 0.28 }))
        layer.on('mouseout', () => (layer as any).setStyle({ weight: 2, fillOpacity: 0.22 }))
      },
    }

    setGeoLayers((prev) => [...prev, outlineLayer, coloredLayer])
  }, [showDistricts, warsawDistricts, selectedDistricts, districtColorMap])

  // Add/Update highlighted streets layer(s)
  useEffect(() => {
    // Remove existing street layers
    setGeoLayers((l) => l.filter((x) => !x.id.startsWith('street-')))
    if (!highlightedStreets.length) return
    setGeoLayers((prev) => [
      ...prev,
      ...highlightedStreets.map((s, idx) => ({
        id: `street-${idx}-${s.name}`,
        data: s.data,
        style: { color: '#ffd54f', weight: 5, opacity: 0.95 },
        onEachFeature: (_: any, layer: any) => {
          layer.bindTooltip(s.name, { sticky: true, className: 'polygon-tooltip' })
        },
      })),
    ])
  }, [highlightedStreets])

  const handleAddStreet = useCallback(async () => {
    const name = streetQuery.trim()
    if (!name) return
    const fc = await fetchStreetByNameInWarsaw(name)
    if (fc && (fc.features?.length ?? 0) > 0) {
      setHighlightedStreets((prev) => {
        if (prev.some((p) => p.name.toLowerCase() === name.toLowerCase())) return prev
        return [...prev, { name, data: fc }]
      })
      setStreetQuery('')
    }
  }, [streetQuery])

  const removeHighlightedStreet = useCallback((name: string) => {
    setHighlightedStreets((prev) => prev.filter((s) => s.name !== name))
  }, [])

  return (
    <div className="app">
      <aside className="sidebar glass purple">
        <h2 className="title">🔎 Wyszukaj lokalizację</h2>
        <div className="stack">
          <div className="field">
            <label className="label">🏠 Adres bazowy</label>
            <div className="field-row nowrap">
              <AddressAutocomplete
                placeholder="np. Marszałkowska 1, Warszawa"
                value={homeQuery}
                onChange={setHomeQuery}
                onSelect={(s) => { setHome({ lat: s.lat, lng: s.lng, label: s.label }); setHomeQuery(s.label) }}
              />
              <button onClick={searchHome} className="btn primary">Szukaj</button>
            </div>
          </div>
          {home && (
            <p className="hint">Wybrana lokalizacja: {home.label ?? `${home.lat.toFixed(5)}, ${home.lng.toFixed(5)}`}</p>
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
                  onChange={setWorkQuery}
                  onSelect={(s) => { setWork({ lat: s.lat, lng: s.lng, label: s.label }); setWorkQuery(s.label) }}
                />
                <button onClick={searchWork} className="btn">Dodaj</button>
              </div>
            </div>

            <div className="field">
              <label className="label">📍 Często odwiedzana lokalizacja</label>
              <div className="field-row nowrap">
                <AddressAutocomplete
                  placeholder="np. dom rodziny, ulubione miejsce"
                  value={frequentQuery}
                  onChange={setFrequentQuery}
                  onSelect={(s) => { setFrequent({ lat: s.lat, lng: s.lng, label: s.label }); setFrequentQuery(s.label) }}
                />
                <button onClick={searchFrequent} className="btn">Dodaj</button>
              </div>
            </div>
          </div>
        </details>

        <details className="section" open>
          <summary>🎛️ Filtry</summary>
          <div className="stack">
            <label className="checkbox left">
              <input type="checkbox" checked={analyzeCommute} onChange={(e) => setAnalyzeCommute(e.target.checked)} />
              <span>⏱️ Analiza czasu dojazdu</span>
            </label>
            {analyzeCommute && (
              <div className="grid-2">
                <div>
                  <label className="label">Tryb</label>
                  <select value={commuteMode} onChange={(e) => setCommuteMode(e.target.value as any)}>
                    <option value="car">Samochód</option>
                    <option value="transit">Komunikacja</option>
                    <option value="bike">Rower</option>
                    <option value="walk">Pieszo</option>
                  </select>
                </div>
                <div>
                  <label className="label">Maks. czas (min)</label>
                  <input type="number" min={5} max={120} value={commuteMaxMins} onChange={(e) => setCommuteMaxMins(Number(e.target.value))} />
                </div>
              </div>
            )}

            <label className="checkbox left">
              <input type="checkbox" checked={considerChild} onChange={(e) => setConsiderChild(e.target.checked)} />
              <span>👶 Czy uwzględnić dziecko?</span>
            </label>
            {considerChild && (
              <div className="field">
                <label className="label">Jaki wiek?</label>
                <input type="number" min={0} max={18} value={childAge} onChange={(e) => setChildAge(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            )}

            <label className="checkbox left">
              <input type="checkbox" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} />
              <span>🐾 Zwierzęta</span>
            </label>

            <label className="checkbox left">
              <input type="checkbox" checked={analyzeGreen} onChange={(e) => setAnalyzeGreen(e.target.checked)} />
              <span>🌳 Analiza "zielonych miejsc" w okolicy</span>
            </label>
            {analyzeGreen && (
              <div className="field">
                <label className="label">Promień analizy (m)</label>
                <input type="range" min={200} max={5000} step={100} value={greenRadius} onChange={(e) => setGreenRadius(Number(e.target.value))} />
                <div className="hint">{greenRadius} m</div>
              </div>
            )}

            <label className="checkbox left">
              <input type="checkbox" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} />
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
                          onChange={(e) => {
                            setSelectedDistricts((prev) => e.target.checked ? [...prev, name] : prev.filter((n) => n !== name))
                          }}
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
                  onChange={(e) => setStreetQuery(e.target.value)}
                />
                <button className="btn" onClick={handleAddStreet}>Dodaj</button>
              </div>
              {highlightedStreets.length > 0 && (
                <div className="stack">
                  {highlightedStreets.map((s) => (
                    <div className="chip" key={s.name}>
                      <span>{s.name}</span>
                      <button className="chip-remove" onClick={() => removeHighlightedStreet(s.name)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </details>

        {commuteInfo && <p className="hint">{commuteInfo}</p>}
      </aside>

      <section className="mapPanel">
        <MapCanvas
          center={mapCenter}
          markers={markers}
          circles={circles}
          geoJsonLayers={geoLayers}
          className="map"
          height="75vh"
        />

        {/* Address tiles below map */}
        <div className="address-cards">
          {home && (
            <div className="address-card">
              <div className="badge" style={{ background: '#e53935' }}>HOME</div>
              <div className="big">{home.label ?? 'Lokalizacja bazowa'}</div>
              <div className="muted">{home.lat.toFixed(5)}, {home.lng.toFixed(5)}</div>
            </div>
          )}
          {work && (
            <div className="address-card">
              <div className="badge" style={{ background: '#1e88e5' }}>WORK</div>
              <div className="big">{work.label ?? 'Praca/Uczelnia'}</div>
              <div className="muted">{work.lat.toFixed(5)}, {work.lng.toFixed(5)}</div>
            </div>
          )}
          {frequent && (
            <div className="address-card">
              <div className="badge" style={{ background: '#8e24aa' }}>SPOT</div>
              <div className="big">{frequent.label ?? 'Często odwiedzana'}</div>
              <div className="muted">{frequent.lat.toFixed(5)}, {frequent.lng.toFixed(5)}</div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {(suggestedDistricts.length > 0 || suggestedStreets.length > 0) && (
          <div className="suggestions">
            <h3 className="title">💡 Sugestie w okolicy</h3>
            {suggestedDistricts.length > 0 && (
              <div className="suggest-group">
                <div className="label">Dzielnice w pobliżu</div>
                <div className="chip-row">
                  {suggestedDistricts.map((name) => (
                    <button
                      key={name}
                      className={"chip" + (selectedDistricts.includes(name) ? ' active' : '')}
                      onClick={() => setSelectedDistricts((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name])}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {suggestedStreets.length > 0 && (
              <div className="suggest-group">
                <div className="label">Ulice w pobliżu</div>
                <div className="chip-row">
                  {suggestedStreets.map((name) => (
                    <button
                      key={name}
                      className="chip"
                      onClick={async () => {
                        const fc = await fetchStreetByNameInWarsaw(name)
                        if (fc && (fc.features?.length ?? 0) > 0) {
                          setHighlightedStreets((prev) => prev.some((p) => p.name.toLowerCase() === name.toLowerCase()) ? prev : [...prev, { name, data: fc }])
                        }
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
