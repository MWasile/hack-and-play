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
      way["highway"]["name"="${streetName.replace(/"/g, '\\"')}"](area.warszawa);
      relation["type"="route"]["route"="road"]["name"="${streetName.replace(/"/g, '\\"')}"](area.warszawa);
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
