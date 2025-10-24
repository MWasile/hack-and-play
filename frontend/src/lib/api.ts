import type { Feature, FeatureCollection, Geometry } from 'geojson'

export type LngLat = { lng: number; lat: number }
export type CommuteMode = 'car' | 'bike' | 'walk' | 'transit'

// OpenRouteService isochrones (POST); returns FeatureCollection or null if no key
export async function fetchIsochronesORS(center: LngLat, mode: CommuteMode, rangeSeconds: number): Promise<FeatureCollection | null> {
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

// OSRM routing via public demo server (no API key)
export async function fetchOSRMRoute(start: LngLat, end: LngLat, mode: CommuteMode): Promise<{ feature: Feature<Geometry>; durationSec: number } | null> {
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

// Overpass: fetch parks/green areas within given radius (converted to GeoJSON)
export async function fetchOverpassGreenAreas(center: LngLat, radiusMeters: number): Promise<FeatureCollection | null> {
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
  const fc = osm2geojson(json) as FeatureCollection
  return fc
}

// New: Overpass – fetch Warsaw districts (dzielnice) as GeoJSON FeatureCollection
export async function fetchWarsawDistricts(): Promise<FeatureCollection | null> {
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
  const fc = osm2geojson(json) as FeatureCollection
  return fc
}

// New: Overpass – fetch a street (way(s)) by name within Warsaw administrative boundary
export async function fetchStreetByNameInWarsaw(streetName: string): Promise<FeatureCollection | null> {
  if (!streetName?.trim()) return null
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
  const fc = osm2geojson(json) as FeatureCollection
  return fc
}

// New: Overpass – fetch nearby named streets around a coordinate (for suggestions)
export async function fetchNearbyNamedStreets(center: LngLat, radiusMeters: number = 2000): Promise<FeatureCollection | null> {
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
  const fc = osm2geojson(json) as FeatureCollection
  return fc
}
