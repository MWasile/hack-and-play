import type { Feature, FeatureCollection, Geometry } from 'geojson'

export type LngLat = { lng: number; lat: number }
export type CommuteMode = 'car' | 'bike' | 'walk' | 'transit'

// --- Mock helpers ---
const USE_MOCKS = String((import.meta as any).env?.VITE_USE_MOCKS ?? '').toLowerCase() === 'true'

function fc(features: Feature<Geometry>[]): FeatureCollection {
  return { type: 'FeatureCollection', features }
}

function makeSquare(center: LngLat, sizeMeters: number, props: any = {}): Feature<Geometry> {
  // very rough: 1 deg lat ~ 111_000 m, 1 deg lng ~ 111_000 m * cos(lat)
  const dLat = sizeMeters / 111000
  const dLng = sizeMeters / (111000 * Math.cos((center.lat * Math.PI) / 180))
  const c = center
  const ring: [number, number][] = [
    [c.lng - dLng, c.lat - dLat],
    [c.lng + dLng, c.lat - dLat],
    [c.lng + dLng, c.lat + dLat],
    [c.lng - dLng, c.lat + dLat],
    [c.lng - dLng, c.lat - dLat],
  ]
  return {
    type: 'Feature',
    properties: { ...props },
    geometry: { type: 'Polygon', coordinates: [ring] } as Geometry,
  }
}

function makeLine(start: LngLat, end: LngLat, props: any = {}): Feature<Geometry> {
  return {
    type: 'Feature',
    properties: { ...props },
    geometry: { type: 'LineString', coordinates: [ [start.lng, start.lat], [end.lng, end.lat] ] } as Geometry,
  }
}

function randomNearby(center: LngLat, meters: number): LngLat {
  const dLat = (Math.random() - 0.5) * (meters / 111000)
  const dLng = (Math.random() - 0.5) * (meters / (111000 * Math.cos((center.lat * Math.PI)/180)))
  return { lat: center.lat + dLat, lng: center.lng + dLng }
}

function distinct<T>(arr: T[]): T[] { return Array.from(new Set(arr)) }

function metersToDeg(centerLat: number, dxMeters: number, dyMeters: number): { dLng: number; dLat: number } {
  const dLat = dyMeters / 111000
  const dLng = dxMeters / (111000 * Math.cos((centerLat * Math.PI) / 180))
  return { dLng, dLat }
}

// --- OpenRouteService isochrones (POST); returns FeatureCollection or null if no key ---
export async function fetchIsochronesORS(center: LngLat, mode: CommuteMode, rangeSeconds: number): Promise<FeatureCollection | null> {
  if (USE_MOCKS) {
    const mins = Math.max(1, Math.round(rangeSeconds / 60))
    const base = Math.min(4000, 2000 + mins * 60) // grow with minutes
    const polys = [makeSquare(center, base, { mode, range_s: rangeSeconds }), makeSquare(center, base * 0.66, { mode, ring: 2 }), makeSquare(center, base * 0.33, { mode, ring: 3 })]
    return fc(polys)
  }
  const apiKey = import.meta.env.VITE_ORS_API_KEY as string | undefined
  if (!apiKey) return null

  const profile = mode === 'car' ? 'driving-car' : mode === 'bike' ? 'cycling-regular' : 'foot-walking'
  const url = `https://api.openrouteservice.org/v2/isochrones/${profile}`
  const body = {
    locations: [[center.lng, center.lat]],
    range: [Math.max(60, Math.min(rangeSeconds, 7200))], // clamp 1–120 min
    units: 'm',
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const data = (await res.json()) as FeatureCollection
  return data
}

// --- OSRM routing via public demo server (no API key) ---
export async function fetchOSRMRoute(start: LngLat, end: LngLat, mode: CommuteMode): Promise<{ feature: Feature<Geometry>; durationSec: number } | null> {
  if (USE_MOCKS) {
    const line = makeLine(start, end, { mode, mock: true })
    const distanceKm = Math.hypot(end.lat - start.lat, (end.lng - start.lng) * Math.cos((start.lat * Math.PI)/180)) * 111
    const speedKmH = mode === 'car' ? 40 : mode === 'bike' ? 15 : 5
    const durationSec = Math.max(5 * 60, Math.round((distanceKm / speedKmH) * 3600))
    return { feature: line, durationSec }
  }
  const profile = mode === 'car' ? 'driving' : mode === 'bike' ? 'cycling' : 'walking' // transit unsupported on OSRM
  const base = 'https://router.project-osrm.org'
  const url = `${base}/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json() as any
  if (!data?.routes?.[0]) return null
  const route = data.routes[0]
  const feature: Feature<Geometry> = {
    type: 'Feature',
    properties: { distance: route.distance, duration: route.duration },
    geometry: route.geometry as Geometry,
  }
  return { feature, durationSec: route.duration as number }
}

// --- Overpass: fetch parks/green areas within given radius (converted to GeoJSON) ---
export async function fetchOverpassGreenAreas(center: LngLat, radiusMeters: number): Promise<FeatureCollection | null> {
  if (USE_MOCKS) {
    const r = Math.max(100, Math.min(radiusMeters, 5000))
    const features: Feature<Geometry>[] = []
    for (let i = 0; i < 4; i++) {
      const c = randomNearby(center, r * 0.7)
      features.push(makeSquare(c, r * 0.2, { leisure: 'park', name: `Park ${i + 1}` }))
    }
    return fc(features)
  }
  const overpassUrl = 'https://overpass-api.de/api/interpreter'
  const { lat, lng } = center
  const radius = Math.max(50, Math.min(radiusMeters, 5000))
  const q = `
    [out:json][timeout:25];
    (
      node["leisure"="park"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
      relation["leisure"="park"](around:${radius},${lat},${lng});
      way["landuse"="grass"](around:${radius},${lat},${lng});
      way["leisure"="garden"](around:${radius},${lat},${lng});
      way["natural"="wood"](around:${radius},${lat},${lng});
    );
    out body; >; out skel qt;`.trim()

  const res = await fetch(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: q }).toString(),
  })
  if (!res.ok) return null
  const json = await res.json()
  // Dynamic import keeps bundle lighter until needed
  const osm2geojson = (await import('osmtogeojson')).default as any
  const fcg = osm2geojson(json) as FeatureCollection
  return fcg
}

// --- Overpass – fetch Warsaw districts (dzielnice) as GeoJSON FeatureCollection ---
export async function fetchWarsawDistricts(): Promise<FeatureCollection | null> {
  if (USE_MOCKS) {
    // Rough Warsaw center
    const WAW = { lat: 52.2297, lng: 21.0122 }
    const names = ['Śródmieście', 'Mokotów', 'Praga-Południe', 'Ursynów', 'Wola', 'Ochota']
    const features = names.map((name) => {
      const c = randomNearby(WAW, 4000)
      return makeSquare(c, 1800, { name })
    })
    return fc(features)
  }
  const overpassUrl = 'https://overpass-api.de/api/interpreter'
  const q = `
    [out:json][timeout:30];
    area["name"="Warszawa"]["boundary"="administrative"]["admin_level"="8"]->.warszawa;
    (
      relation["boundary"="administrative"]["admin_level"="9"](area.warszawa);
    );
    out body; >; out skel qt;`.trim()

  const res = await fetch(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: q }).toString(),
  })
  if (!res.ok) return null
  const json = await res.json()
  const osm2geojson = (await import('osmtogeojson')).default as any
  const fcg = osm2geojson(json) as FeatureCollection
  return fcg
}

// --- Overpass – fetch a street (way(s)) by name within Warsaw administrative boundary ---
export async function fetchStreetByNameInWarsaw(streetName: string): Promise<FeatureCollection | null> {
  if (!streetName?.trim()) return null
  if (USE_MOCKS) {
    const base = { lat: 52.2297, lng: 21.0122 }
    const a = randomNearby(base, 3000)
    const b = randomNearby(a, 2000)
    const feature = makeLine(a, b, { name: streetName, highway: 'primary' })
    return fc([feature])
  }
  const overpassUrl = 'https://overpass-api.de/api/interpreter'
  const q = `
    [out:json][timeout:30];
    area["name"="Warszawa"]["boundary"="administrative"]["admin_level"="8"]->.warszawa;
    (
      way["highway"]["name"="${streetName.replace(/"/g, '\"')}"](area.warszawa);
      relation["type"="route"]["route"="road"]["name"="${streetName.replace(/"/g, '\"')}"](area.warszawa);
    );
    out body; >; out skel qt;`.trim()

  const res = await fetch(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: q }).toString(),
  })
  if (!res.ok) return null
  const json = await res.json()
  const osm2geojson = (await import('osmtogeojson')).default as any
  const fcg = osm2geojson(json) as FeatureCollection
  return fcg
}

// --- Overpass – fetch nearby named streets around a coordinate (for suggestions) ---
export async function fetchNearbyNamedStreets(center: LngLat, radiusMeters: number = 2000): Promise<FeatureCollection | null> {
  if (USE_MOCKS) {
    const names = ['Puławska', 'Marszałkowska', 'Jerozolimskie', 'Solidarności', 'Sobieskiego', 'Górczewska']
    const feats: Feature<Geometry>[] = []
    for (const name of distinct(names)) {
      const a = randomNearby(center, radiusMeters * 0.6)
      const b = randomNearby(a, radiusMeters * 0.4)
      feats.push(makeLine(a, b, { name, highway: 'primary' }))
    }
    return fc(feats)
  }
  const overpassUrl = 'https://overpass-api.de/api/interpreter'
  const { lat, lng } = center
  const radius = Math.max(100, Math.min(radiusMeters, 5000))
  const q = `
    [out:json][timeout:30];
    (
      way["highway"]["name"](around:${radius},${lat},${lng});
    );
    out body; >; out skel qt;`.trim()

  const res = await fetch(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: q }).toString(),
  })
  if (!res.ok) return null
  const json = await res.json()
  const osm2geojson = (await import('osmtogeojson')).default as any
  const fcg = osm2geojson(json) as FeatureCollection
  return fcg
}

// --- Advanced filters (mock only) ---
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export async function fetchTrafficGrid(center: LngLat, radiusMeters: number, time: TimeOfDay): Promise<FeatureCollection> {
  // mock grid of squares colored by traffic intensity 0..1
  const size = Math.max(400, Math.min(radiusMeters / 4, 1200))
  const cols = 5
  const rows = 5
  const features: Feature<Geometry>[] = []
  for (let y = -Math.floor(rows/2); y <= Math.floor(rows/2); y++) {
    for (let x = -Math.floor(cols/2); x <= Math.floor(cols/2); x++) {
      const { dLng, dLat } = metersToDeg(center.lat, x * size * 1.2, y * size * 1.2)
      const c = { lat: center.lat + dLat, lng: center.lng + dLng }
      // vary intensity by time of day
      const base = time === 'morning' ? 0.6 : time === 'afternoon' ? 0.5 : 0.4
      const noise = Math.random() * 0.4
      const tscore = Math.min(1, Math.max(0.05, base + noise - (Math.abs(x) + Math.abs(y)) * 0.06))
      features.push(makeSquare(c, size, { kind: 'traffic', time, tscore }))
    }
  }
  return fc(features)
}

export async function fetchSocialLifeHotspots(center: LngLat, radiusMeters: number): Promise<FeatureCollection> {
  // mock points where social activity is high
  const pts: Feature<Geometry>[] = []
  const N = 12
  for (let i = 0; i < N; i++) {
    const p = randomNearby(center, radiusMeters * 0.9)
    const score = Math.random() * 0.7 + 0.3
    pts.push({ type: 'Feature', properties: { kind: 'social', score, name: `Hotspot ${i+1}` }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } as Geometry })
  }
  return fc(pts)
}

export async function fetchDistrictRhythm(center: LngLat, radiusMeters: number): Promise<FeatureCollection> {
  // mock labeled zones: sypialnia/rodzinna/biurowa
  const types = ['sypialnia', 'rodzinna', 'biurowa'] as const
  const feats: Feature<Geometry>[] = []
  const size = Math.max(600, Math.min(radiusMeters / 3, 1600))
  for (let i = 0; i < 6; i++) {
    const c = randomNearby(center, radiusMeters)
    const t = types[Math.floor(Math.random()*types.length)]
    feats.push(makeSquare(c, size, { kind: 'rhythm', type: t }))
  }
  return fc(feats)
}

export async function fetchDigitalNoise(center: LngLat, radiusMeters: number): Promise<FeatureCollection> {
  // mock grid with noise intensity 0..1
  const size = Math.max(400, Math.min(radiusMeters / 4, 1200))
  const feats: Feature<Geometry>[] = []
  for (let i = 0; i < 14; i++) {
    const c = randomNearby(center, radiusMeters * 0.9)
    const noise = Math.random()
    feats.push(makeSquare(c, size, { kind: 'digital-noise', noise }))
  }
  return fc(feats)
}

export async function fetchLifeBalance(center: LngLat, radiusMeters: number): Promise<FeatureCollection> {
  const size = Math.max(500, Math.min(radiusMeters / 3, 1500))
  const feats: Feature<Geometry>[] = []
  for (let i = 0; i < 8; i++) {
    const c = randomNearby(center, radiusMeters)
    const balance = Math.random() * 0.6 + 0.2
    feats.push(makeSquare(c, size, { kind: 'life-balance', balance }))
  }
  return fc(feats)
}

export async function fetchSocialAvailability(center: LngLat, radiusMeters: number): Promise<Feature<Geometry> | FeatureCollection> {
  const size = Math.max(400, Math.min(radiusMeters / 4, 1200))
  const feats: Feature<Geometry>[] = []
  for (let i = 0; i < 10; i++) {
    const c = randomNearby(center, radiusMeters)
    const availability = Math.random()
    feats.push(makeSquare(c, size, { kind: 'social-availability', availability }))
  }
  return fc(feats)
}

export async function fetchSafetyIncidents(center: LngLat, radiusMeters: number): Promise<FeatureCollection> {
  // mock points with severity 1..5
  const pts: Feature<Geometry>[] = []
  const N = 20
  for (let i = 0; i < N; i++) {
    const p = randomNearby(center, radiusMeters)
    const severity = Math.floor(Math.random() * 5) + 1
    pts.push({ type: 'Feature', properties: { kind: 'safety', severity }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } as Geometry })
  }
  return fc(pts)
}
