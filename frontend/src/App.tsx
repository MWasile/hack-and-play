import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import MapCanvas, { type CircleSpec, type MarkerSpec } from './components/MapCanvas'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import L from 'leaflet'
import { fetchIsochronesORS, fetchOSRMRoute, fetchOverpassGreenAreas, fetchWarsawDistricts, fetchStreetByNameInWarsaw, fetchNearbyNamedStreets, fetchTrafficGrid, fetchSocialLifeHotspots, fetchDistrictRhythm, fetchDigitalNoise, fetchLifeBalance, fetchSocialAvailability, fetchSafetyIncidents, type TimeOfDay } from './lib/api'
import Sidebar from './components/Sidebar'
import AddressCards from './components/AddressCards'
import Suggestions from './components/Suggestions'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import MapLegend from './components/MapLegend'
import CommuteSummary from './components/CommuteSummary'
import { motion } from 'framer-motion'

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

  // Loading flags for search actions
  const [isHomeSearching, setIsHomeSearching] = useState(false)
  const [isWorkSearching, setIsWorkSearching] = useState(false)
  const [isFrequentSearching, setIsFrequentSearching] = useState(false)

  // Locations
  const [home, setHome] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [work, setWork] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [frequent, setFrequent] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  // New: multiple frequent locations (last item is the primary SPOT)
  const [frequentList, setFrequentList] = useState<Array<{ lat: number; lng: number; label?: string }>>([])

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

  // Advanced overlays controls
  const [analysisRadius, setAnalysisRadius] = useState(3000)
  const [showTraffic, setShowTraffic] = useState(false)
  const [trafficTime, setTrafficTime] = useState<TimeOfDay>('morning')
  const [showSocialLife, setShowSocialLife] = useState(false)
  const [showDistrictRhythm, setShowDistrictRhythm] = useState(false)
  const [showDigitalNoise, setShowDigitalNoise] = useState(false)
  const [showLifeBalance, setShowLifeBalance] = useState(false)
  const [showSocialAvailability, setShowSocialAvailability] = useState(false)
  const [showSafety, setShowSafety] = useState(false)

  // Comparisons of SPOTs to Work
  const [comparisons, setComparisons] = useState<Array<{ label: string; mins: number; distanceMeters?: number; homeMins?: number; homeDistanceMeters?: number }>>([])
  const [comparisonsLoading, setComparisonsLoading] = useState(false)
  // New: explicit flag for commute analysis (isochrones/route) to control CTA disabled state
  const [isCommuteCalculating, setIsCommuteCalculating] = useState(false)

  // Deterministic color per district name (HSL based on string hash)
  function hashString(s: string): number {
    let h = 5381
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) + s.charCodeAt(i) // h * 33 + c
      h |= 0
    }
    return Math.abs(h)
  }
  function hsl(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
  }
  function districtColor(name: string | undefined): { stroke: string; fill: string } {
    if (!name) return { stroke: '#555', fill: 'rgba(120,120,120,0.35)' }
    const hue = hashString(name.toLowerCase()) % 360
    return {
      stroke: hsl(hue, 70, 40),
      fill: hsl(hue, 65, 55),
    }
  }

  // Geocode actions
  const searchHome = useCallback(async () => {
    try {
      setIsHomeSearching(true)
      const res = await geocodeAddress(homeQuery)
      if (res) setHome(res)
    } finally {
      setIsHomeSearching(false)
    }
  }, [homeQuery])

  const searchWork = useCallback(async () => {
    try {
      setIsWorkSearching(true)
      const res = await geocodeAddress(workQuery)
      if (res) setWork(res)
    } finally {
      setIsWorkSearching(false)
    }
  }, [workQuery])

  const searchFrequent = useCallback(async () => {
    try {
      setIsFrequentSearching(true)
      const res = await geocodeAddress(frequentQuery)
      if (res) {
        setFrequent(res) // keep primary for backward references
        setFrequentList((prev) => [...prev, res])
      }
    } finally {
      setIsFrequentSearching(false)
    }
  }, [frequentQuery])

  // Map markers from selected locations – show short labels
  const markers: MarkerSpec[] = useMemo(() => {
    const m: MarkerSpec[] = []
    if (home) m.push({ id: 'home', position: home, label: 'HOME', color: '#e53935' })
    if (work) m.push({ id: 'work', position: work, label: 'WORK', color: '#1e88e5' })
    if (frequentList.length > 0) {
      // Others first (without center control id)
      const others = frequentList.slice(0, -1)
      others.forEach((f, i) => m.push({ id: `frequent-${i}`, position: f, label: 'SPOT', color: '#8e24aa' }))
      const last = frequentList[frequentList.length - 1]
      m.push({ id: 'frequent', position: last, label: 'SPOT', color: '#8e24aa' })
    } else if (frequent) {
      m.push({ id: 'frequent', position: frequent, label: 'SPOT', color: '#8e24aa' })
    }
    return m
  }, [home, work, frequent, frequentList])

  // Optional circles: analysis range (dashed) around current center, and green-area circle around home
  const mapCenterCandidate = useMemo(() => {
    const lastFrequent = frequentList.length ? frequentList[frequentList.length - 1] : frequent
    return home ?? work ?? lastFrequent ?? null
  }, [home, work, frequent, frequentList])
  const circles: CircleSpec[] = useMemo(() => {
    const arr: CircleSpec[] = []
    const mapCenter = mapCenterCandidate
    if (mapCenter) {
      arr.push({
        id: 'analysis-range',
        center: mapCenter,
        radiusMeters: analysisRadius,
        color: '#1e88e5',
        fillOpacity: 0,
        opacity: 1,
        weight: 2,
        dashArray: '6 6',
      })
    }
    if (analyzeGreen && home) {
      arr.push({
        id: 'green-radius',
        center: home,
        radiusMeters: greenRadius,
        color: '#2e7d32',
        fillColor: '#66bb6a',
        opacity: 0.8,
        fillOpacity: 0.15,
      })
    }
    return arr
  }, [mapCenterCandidate, analysisRadius, analyzeGreen, greenRadius, home])

  // Restore preferences on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hp_prefs_v1')
      if (!raw) return
      const p = JSON.parse(raw)
      if (p.home) { setHome(p.home); if (p.home.label) setHomeQuery(p.home.label) }
      if (p.work) { setWork(p.work); if (p.work.label) setWorkQuery(p.work.label) }
      if (Array.isArray(p.frequentList)) {
        setFrequentList(p.frequentList)
        if (p.frequentList.length) { const last = p.frequentList[p.frequentList.length - 1]; setFrequent(last); if (last.label) setFrequentQuery(last.label) }
      } else if (p.frequent) {
        setFrequent(p.frequent); if (p.frequent.label) setFrequentQuery(p.frequent.label)
      }
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
      setAnalysisRadius(p.analysisRadius ?? 3000)
      setShowTraffic(!!p.showTraffic)
      setTrafficTime(p.trafficTime ?? 'morning')
      setShowSocialLife(!!p.showSocialLife)
      setShowDistrictRhythm(!!p.showDistrictRhythm)
      setShowDigitalNoise(!!p.showDigitalNoise)
      setShowLifeBalance(!!p.showLifeBalance)
      setShowSocialAvailability(!!p.showSocialAvailability)
      setShowSafety(!!p.showSafety)
    } catch {}
  }, [])

  // Persist preferences when inputs change
  useEffect(() => {
    const prefs = {
      home, work, frequent,
      frequentList,
      analyzeCommute, commuteMode, commuteMaxMins,
      considerChild, childAge, hasPets,
      analyzeGreen, greenRadius,
      showDistricts, selectedDistricts,
      analysisRadius,
      showTraffic, trafficTime,
      showSocialLife, showDistrictRhythm, showDigitalNoise, showLifeBalance, showSocialAvailability, showSafety,
      highlightedStreetsNames: highlightedStreets.map((s) => s.name),
    }
    localStorage.setItem('hp_prefs_v1', JSON.stringify(prefs))
  }, [home, work, frequent, frequentList, analyzeCommute, commuteMode, commuteMaxMins, considerChild, childAge, hasPets, analyzeGreen, greenRadius, showDistricts, selectedDistricts, highlightedStreets, analysisRadius, showTraffic, trafficTime, showSocialLife, showDistrictRhythm, showDigitalNoise, showLifeBalance, showSocialAvailability, showSafety])

  // Commute analysis: ORS isochrones if key present; otherwise OSRM routing to Work
  useEffect(() => {
    let cancelled = false
    async function run() {
      setCommuteInfo('')
      setGeoLayers((l) => l.filter((x) => !x.id.startsWith('iso'))) // clear old isochrones
      if (!analyzeCommute || !home) return

      setIsCommuteCalculating(true)
      try {
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
      } finally {
        if (!cancelled) setIsCommuteCalculating(false)
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

  // Show selected Warsaw districts on map
  useEffect(() => {
    // Remove previous districts layers
    setGeoLayers((l) => l.filter((x) => !x.id.startsWith('warsaw-district')))
    if (!showDistricts || !warsawDistricts) return
    const sel = new Set(selectedDistricts.map((n) => n.toLowerCase()))
    const feats = (warsawDistricts.features || []).filter((f: any) => {
      const name = f.properties?.name || f.properties?.tags?.name
      return name && sel.has(String(name).toLowerCase())
    })
    if (!feats.length) return
    const fc: FeatureCollection = { type: 'FeatureCollection', features: feats as any }
    setGeoLayers((prev) => [
      ...prev,
      {
        id: 'warsaw-districts',
        data: fc,
        style: (feature: any) => {
          const name = feature?.properties?.name || feature?.properties?.tags?.name
          const { stroke, fill } = districtColor(typeof name === 'string' ? name : undefined)
          return { color: stroke, weight: 2, fillColor: fill, fillOpacity: 0.18, opacity: 0.9 }
        },
        onEachFeature: (feature: any, layer: any) => {
          const name = feature?.properties?.name || feature?.properties?.tags?.name || 'Dzielnica'
          layer.bindTooltip(String(name), { sticky: true, className: 'polygon-tooltip' })
        },
      },
    ])
  }, [showDistricts, warsawDistricts, selectedDistricts])

  // Suggest districts based on home location and selected districts
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

  // Advanced overlays: helpers for coloring
  function colorRamp(value: number, colors: [string, string, string] = ['#2e7d32', '#ffd54f', '#e53935']): string {
    const v = Math.max(0, Math.min(1, value))
    // simple 2-stop blend between low-mid and mid-high
    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#','')
      return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
      ]
    }
    function blend(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
      ]
    }
    const [c1, c2, c3] = colors.map(hexToRgb)
    const mid = 0.5
    const rgb = v < mid ? blend(c1, c2, v / mid) : blend(c2, c3, (v - mid) / (1 - mid))
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }

  // Traffic grid overlay
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'traffic-grid'))
    if (!showTraffic) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const fc = await fetchTrafficGrid({ lat: center.lat, lng: center.lng }, analysisRadius, trafficTime)
      if (cancelled) return
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'traffic-grid',
          data: fc,
          style: (feature: any) => {
            const t = Number(feature?.properties?.tscore ?? 0)
            const color = colorRamp(t, ['#66bb6a', '#ffd54f', '#e53935'])
            return { color, fillColor: color, weight: 1, fillOpacity: 0.22, opacity: 0.9 }
          },
          onEachFeature: (feature: any, layer: any) => {
            const t = Number(feature?.properties?.tscore ?? 0)
            layer.bindTooltip(`Ruch: ${(t * 100).toFixed(0)}%`, { sticky: true, className: 'polygon-tooltip' })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showTraffic, trafficTime, analysisRadius, mapCenterCandidate])

  // Social life hotspots (points)
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'social-life'))
    if (!showSocialLife) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const data = await fetchSocialLifeHotspots({ lat: center.lat, lng: center.lng }, analysisRadius)
      if (cancelled) return
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'social-life',
          data,
          pointToLayer: (_feat: any, latlng: any) => {
            const score = Number((_feat as any)?.properties?.score ?? 0.5)
            const radius = 6 + score * 10
            const color = '#ff6ec7'
            return (window as any).L ? (window as any).L.circleMarker(latlng, { radius, color, fillColor: color, fillOpacity: 0.4, weight: 1 }) : L.circleMarker(latlng, { radius, color, fillColor: color, fillOpacity: 0.4, weight: 1 })
          },
          onEachFeature: (feature: any, layer: any) => {
            const s = Number(feature?.properties?.score ?? 0)
            layer.bindTooltip(`Życie społeczne: ${(s * 100).toFixed(0)}%`, { sticky: true })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showSocialLife, analysisRadius, mapCenterCandidate])

  // District rhythm
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'district-rhythm'))
    if (!showDistrictRhythm) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const data = await fetchDistrictRhythm({ lat: center.lat, lng: center.lng }, analysisRadius)
      if (cancelled) return
      const colorBy = (t: string) => t === 'biurowa' ? '#42a5f5' : t === 'rodzinna' ? '#ab47bc' : '#8d6e63'
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'district-rhythm',
          data,
          style: (feature: any) => {
            const t = String(feature?.properties?.type ?? 'sypialnia')
            const color = colorBy(t)
            return { color, fillColor: color, weight: 2, fillOpacity: 0.15, opacity: 0.9 }
          },
          onEachFeature: (feature: any, layer: any) => {
            const t = String(feature?.properties?.type ?? 'strefa')
            layer.bindTooltip(`Rytm: ${t}`, { sticky: true, className: 'polygon-tooltip' })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showDistrictRhythm, analysisRadius, mapCenterCandidate])

  // Digital noise
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'digital-noise'))
    if (!showDigitalNoise) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const data = await fetchDigitalNoise({ lat: center.lat, lng: center.lng }, analysisRadius)
      if (cancelled) return
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'digital-noise',
          data,
          style: (feature: any) => {
            const n = Number(feature?.properties?.noise ?? 0)
            const color = colorRamp(n, ['#7c4dff', '#ce93d8', '#f48fb1'])
            return { color, fillColor: color, weight: 1, fillOpacity: 0.18, opacity: 0.9, dashArray: '4 4' }
          },
          onEachFeature: (feature: any, layer: any) => {
            const n = Number(feature?.properties?.noise ?? 0)
            layer.bindTooltip(`Cyfrowy hałas: ${(n * 100).toFixed(0)}%`, { sticky: true })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showDigitalNoise, analysisRadius, mapCenterCandidate])

  // Life balance
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'life-balance'))
    if (!showLifeBalance) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const data = await fetchLifeBalance({ lat: center.lat, lng: center.lng }, analysisRadius)
      if (cancelled) return
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'life-balance',
          data,
          style: (feature: any) => {
            const b = Number(feature?.properties?.balance ?? 0)
            const color = colorRamp(b, ['#81c784', '#fff59d', '#ffb74d'])
            return { color, fillColor: color, weight: 1, fillOpacity: 0.2, opacity: 0.9 }
          },
          onEachFeature: (feature: any, layer: any) => {
            const b = Number(feature?.properties?.balance ?? 0)
            layer.bindTooltip(`Life balance: ${(b * 100).toFixed(0)}%`, { sticky: true })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showLifeBalance, analysisRadius, mapCenterCandidate])

  // Social availability
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'social-availability'))
    if (!showSocialAvailability) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const data = await fetchSocialAvailability({ lat: center.lat, lng: center.lng }, analysisRadius)
      if (cancelled) return
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'social-availability',
          data: data as any,
          style: (feature: any) => {
            const a = Number(feature?.properties?.availability ?? 0)
            const color = colorRamp(a, ['#4dd0e1', '#80cbc4', '#00acc1'])
            return { color, fillColor: color, weight: 1, fillOpacity: 0.18, opacity: 0.9 }
          },
          onEachFeature: (feature: any, layer: any) => {
            const a = Number(feature?.properties?.availability ?? 0)
            layer.bindTooltip(`Dostępność społeczna: ${(a * 100).toFixed(0)}%`, { sticky: true })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showSocialAvailability, analysisRadius, mapCenterCandidate])

  // Safety incidents (points)
  useEffect(() => {
    setGeoLayers((l) => l.filter((x) => x.id !== 'safety-incidents'))
    if (!showSafety) return
    const center = mapCenterCandidate
    if (!center) return
    let cancelled = false
    ;(async () => {
      const data = await fetchSafetyIncidents({ lat: center.lat, lng: center.lng }, analysisRadius)
      if (cancelled) return
      setGeoLayers((prev) => [
        ...prev,
        {
          id: 'safety-incidents',
          data,
          pointToLayer: (feature: any, latlng: any) => {
            const sev = Number(feature?.properties?.severity ?? 3)
            const t = Math.max(0, Math.min(1, (sev - 1) / 4))
            const color = colorRamp(t, ['#81c784', '#ffd54f', '#e53935'])
            const radius = 4 + t * 8
            return L.circleMarker(latlng, { radius, color, fillColor: color, fillOpacity: 0.45, weight: 1 })
          },
          onEachFeature: (feature: any, layer: any) => {
            const sev = Number(feature?.properties?.severity ?? 3)
            layer.bindTooltip(`Incydenty: ${sev}/5`, { sticky: true })
          },
        },
      ])
    })()
    return () => { cancelled = true }
  }, [showSafety, analysisRadius, mapCenterCandidate])

  const addStreetByName = useCallback(async (name: string) => {
    const fc = await fetchStreetByNameInWarsaw(name)
    if (fc && (fc.features?.length ?? 0) > 0) {
      setHighlightedStreets((prev) => prev.some((p) => p.name.toLowerCase() === name.toLowerCase()) ? prev : [...prev, { name, data: fc }])
    }
  }, [])

  // Compute comparisons whenever Work / frequentList / mode changes
  useEffect(() => {
    let cancelled = false
    function approxDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
      // rough distance using equirectangular approximation
      const R = 6371000
      const toRad = (d: number) => d * Math.PI / 180
      const x = (toRad(b.lng - a.lng)) * Math.cos(toRad((a.lat + b.lat) / 2))
      const y = toRad(b.lat - a.lat)
      return Math.hypot(x, y) * R
    }
    async function run() {
      setComparisons([])
      if (frequentList.length === 0) { setComparisonsLoading(false); return }
      // proceed if at least one target (work or home) exists
      if (!work && !home) { setComparisonsLoading(false); return }
      setComparisonsLoading(true)
      try {
        const modeForOSRM = commuteMode === 'transit' ? 'car' : commuteMode
        const reqs = frequentList.map(async (spot, i) => {
          let workMins = NaN
          let workDistance = NaN
          if (work) {
            const resWork = await fetchOSRMRoute({ lat: spot.lat, lng: spot.lng }, { lat: work.lat, lng: work.lng }, modeForOSRM as any)
            workMins = resWork ? Math.max(1, Math.round((resWork.durationSec) / 60)) : NaN
            const dWork = resWork ? Number((resWork.feature as any)?.properties?.distance ?? NaN) : NaN
            workDistance = Number.isFinite(dWork) ? dWork : approxDistanceMeters(spot, work)
          }

          let homeMins = NaN
          let homeDistance = NaN
          if (home) {
            const resHome = await fetchOSRMRoute({ lat: spot.lat, lng: spot.lng }, { lat: home.lat, lng: home.lng }, modeForOSRM as any)
            homeMins = resHome ? Math.max(1, Math.round((resHome.durationSec) / 60)) : NaN
            const dHome = resHome ? Number((resHome.feature as any)?.properties?.distance ?? NaN) : NaN
            homeDistance = Number.isFinite(dHome) ? dHome : approxDistanceMeters(spot, home)
          }

          return {
            label: spot.label ?? `Lokalizacja #${i + 1}`,
            mins: workMins,
            distanceMeters: workDistance,
            homeMins,
            homeDistanceMeters: homeDistance,
          }
        })
        const results = await Promise.all(reqs)
        const filtered = results.filter(r => Number.isFinite(r.mins) || Number.isFinite(r.homeMins ?? NaN))
        if (!cancelled) setComparisons(filtered)
      } finally {
        if (!cancelled) setComparisonsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [work, home, frequentList, commuteMode])

  // Reorder frequent spots (drag-and-drop from Sidebar chips)
  const reorderFrequent = useCallback((from: number, to: number) => {
    setFrequentList((prev) => {
      if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  return (
    <div className="page">
      <TopBar />
      <main className="app">
        <Sidebar
          homeQuery={homeQuery}
          onHomeQueryChange={setHomeQuery}
          onHomeSelect={(s) => setHome(s)}
          onHomeSearch={searchHome}
          homeLabel={home?.label ?? null}
          isHomeSearching={isHomeSearching}

          workQuery={workQuery}
          onWorkQueryChange={setWorkQuery}
          onWorkSelect={(s) => setWork(s)}
          onWorkSearch={searchWork}
          isWorkSearching={isWorkSearching}

          frequentQuery={frequentQuery}
          onFrequentQueryChange={setFrequentQuery}
          onFrequentSelect={(s) => { setFrequent(s); setFrequentList((prev) => [...prev, s]) }}
          onFrequentSearch={searchFrequent}
          frequentLocations={frequentList}
          onRemoveFrequent={(index) => setFrequentList((prev) => prev.filter((_, i) => i !== index))}
          onReorderFrequent={reorderFrequent}
          isFrequentSearching={isFrequentSearching}

          analyzeCommute={analyzeCommute}
          onAnalyzeCommuteChange={setAnalyzeCommute}
          commuteMode={commuteMode}
          onCommuteModeChange={setCommuteMode}
          commuteMaxMins={commuteMaxMins}
          onCommuteMaxMinsChange={setCommuteMaxMins}

          considerChild={considerChild}
          onConsiderChildChange={setConsiderChild}
          childAge={childAge}
          onChildAgeChange={setChildAge}

          hasPets={hasPets}
          onHasPetsChange={setHasPets}

          showDistricts={showDistricts}
          districtNames={districtNames}
          selectedDistricts={selectedDistricts}
          onToggleDistrict={(name, checked) => setSelectedDistricts((prev) => checked ? Array.from(new Set([...prev, name])) : prev.filter((n) => n !== name))}

          streetQuery={streetQuery}
          onStreetQueryChange={setStreetQuery}
          highlightedStreets={highlightedStreets}
          onAddStreet={async () => {
            const name = streetQuery.trim()
            if (!name) return
            const data = await fetchStreetByNameInWarsaw(name)
            if (data) setHighlightedStreets((prev) => [...prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase()), { name, data }])
          }}
          onRemoveHighlightedStreet={(name) => setHighlightedStreets((prev) => prev.filter((s) => s.name !== name))}

          commuteInfo={commuteInfo}
          comparisons={comparisons}
          comparisonsLoading={comparisonsLoading}
        />

        <div className="mapPanel">
          {/** CTA: disable and show spinner until first computations finish */}
          {(() => {
            const analyzing = analyzeCommute && (isCommuteCalculating || comparisonsLoading)
            return (
              <motion.button
                type="button"
                className="main-cta"
                onClick={() => setAnalyzeCommute(true)}
                disabled={analyzing || analyzeCommute}
                title={analyzeCommute ? 'Analiza włączona' : 'Rozpocznij analizę dojazdu i porównań'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                {analyzing ? <><span className="spinner" aria-hidden /> Analiza…</> : (analyzeCommute ? 'Analiza dojazdu włączona' : 'Start analizy dojazdu')}
              </motion.button>
            )
          })()}

          <MapCanvas
            center={mapCenterCandidate ?? undefined}
            markers={markers}
            circles={circles}
            height="70vh"
            geoJsonLayers={geoLayers}
          />

          <CommuteSummary
            commuteMode={commuteMode}
            comparisons={comparisons}
            comparisonsLoading={comparisonsLoading}
            commuteInfo={commuteInfo}
          />

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <AddressCards home={home ?? undefined} work={work ?? undefined} frequentList={frequentList.length ? frequentList : undefined} frequent={frequent ?? undefined} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Suggestions
              suggestedDistricts={suggestedDistricts}
              selectedDistricts={selectedDistricts}
              onToggleDistrict={(name: string) => setSelectedDistricts((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name])}
              suggestedStreets={suggestedStreets}
              onAddStreetByName={addStreetByName}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <MapLegend
              disabled={!mapCenterCandidate}
              analysisRadius={analysisRadius}
              onAnalysisRadiusChange={setAnalysisRadius}
              greenRadius={greenRadius}
              onGreenRadiusChange={setGreenRadius}

              analyzeGreen={analyzeGreen}
              onAnalyzeGreenChange={setAnalyzeGreen}
              showDistricts={showDistricts}
              onShowDistrictsChange={setShowDistricts}

              showTraffic={showTraffic}
              onShowTrafficChange={setShowTraffic}
              trafficTime={trafficTime}
              onTrafficTimeChange={setTrafficTime}

              showSocialLife={showSocialLife}
              onShowSocialLifeChange={setShowSocialLife}
              showDistrictRhythm={showDistrictRhythm}
              onShowDistrictRhythmChange={setShowDistrictRhythm}
              showDigitalNoise={showDigitalNoise}
              onShowDigitalNoiseChange={setShowDigitalNoise}
              showLifeBalance={showLifeBalance}
              onShowLifeBalanceChange={setShowLifeBalance}
              showSocialAvailability={showSocialAvailability}
              onShowSocialAvailabilityChange={setShowSocialAvailability}
              showSafety={showSafety}
              onShowSafetyChange={setShowSafety}
            />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
