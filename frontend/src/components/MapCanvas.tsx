import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import type { LatLngExpression, Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

export type MarkerSpec = {
  id: string
  position: { lat: number; lng: number }
  label?: string
  color?: string
}

export type PolylineSpec = {
  id: string
  positions: { lat: number; lng: number }[]
  color?: string
}

export type CircleSpec = {
  id: string
  center: { lat: number; lng: number }
  radiusMeters: number
  color?: string
  fillColor?: string
  opacity?: number
  fillOpacity?: number
  // Added: outline styling
  weight?: number
  dashArray?: string
}

export type GeoJsonLayerSpec = {
  id: string
  data: FeatureCollection | Feature<Geometry>
  style?: L.PathOptions | L.StyleFunction
  onEachFeature?: L.GeoJSONOptions['onEachFeature']
  pointToLayer?: L.GeoJSONOptions['pointToLayer']
}

interface Props {
  center?: { lat: number; lng: number } | null
  markers?: MarkerSpec[]
  polylines?: PolylineSpec[]
  circles?: CircleSpec[]
  className?: string
  height?: string
  onMapReady?: (map: LeafletMap) => void
  // New: allow user to pick a location by clicking the map
  onPickLocation?: (lat: number, lng: number) => void
  // New: GeoJSON layers for polygons or multipolygons
  geoJsonLayers?: GeoJsonLayerSpec[]
}

export default function MapCanvas({
  center,
  markers = [],
  polylines = [],
  circles = [],
  className,
  height = '100%',
  onPickLocation,
  geoJsonLayers = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const polylinesRef = useRef<Record<string, L.Polyline>>({})
  const circlesRef = useRef<Record<string, L.Circle>>({})
  const geoJsonRef = useRef<Record<string, L.GeoJSON>>({})
  const centerControlRef = useRef<L.Control | null>(null)

  const defaultCenter = useMemo(() => ({ lat: 52.2297, lng: 21.0122 }), []) // Warsaw as sensible default

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [center?.lat ?? defaultCenter.lat, center?.lng ?? defaultCenter.lng],
      zoom: 12,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    if (onPickLocation) {
      map.on('click', (ev: L.LeafletMouseEvent) => {
        onPickLocation(ev.latlng.lat, ev.latlng.lng)
      })
    }

    mapRef.current = map

    // Ensure map resizes properly when container size changes
    setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = {}
      polylinesRef.current = {}
      circlesRef.current = {}
      geoJsonRef.current = {}
    }
  }, [center, defaultCenter, onPickLocation])

  // Update view when center changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !center) return
    map.setView([center.lat, center.lng])
  }, [center])

  // Sync markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const desiredIds = new Set(markers.map((m) => m.id))
    // remove obsolete
    Object.keys(markersRef.current).forEach((id) => {
      if (!desiredIds.has(id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })

    // Precompute numbered labels for SPOT markers
    const spotMarkers = markers.filter((m) => m.id === 'frequent' || m.id.startsWith('frequent-'))
    const spotLabelById: Record<string, string> = {}
    spotMarkers.forEach((m, idx) => { spotLabelById[m.id] = `SPOT ${idx + 1}` })

    // add/update
    markers.forEach((m) => {
      const key = m.id
      const pos: LatLngExpression = [m.position.lat, m.position.lng]
      const tooltipClass = `marker-tooltip marker-${m.id}`
      const isSpot = m.id === 'frequent' || m.id.startsWith('frequent-')
      const effectiveLabel = isSpot ? (spotLabelById[m.id] ?? 'SPOT') : (m.label || '')

      if (!markersRef.current[key]) {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${m.color ?? '#2e7d32'};width:12px;height:12px;border:2px solid white;border-radius:50%"></div>`
        })
        const mk = L.marker(pos, { icon }).addTo(map)
        // Always show tooltip for SPOTs; for others, show if label provided
        if (isSpot || m.label) {
          mk.bindPopup(effectiveLabel)
          mk.bindTooltip(effectiveLabel, { permanent: true, direction: 'top', offset: L.point(0, -10), className: tooltipClass })
        }
        markersRef.current[key] = mk
      } else {
        const mk = markersRef.current[key]
        mk.setLatLng(pos)
        if (isSpot || m.label) {
          if ((mk as any).getPopup && mk.getPopup()) (mk.getPopup() as any).setContent(effectiveLabel)
          else mk.bindPopup(effectiveLabel)
          if ((mk as any).getTooltip && mk.getTooltip()) (mk.getTooltip() as any).setContent(effectiveLabel)
          else mk.bindTooltip(effectiveLabel, { permanent: true, direction: 'top', offset: L.point(0, -10), className: tooltipClass })
        }
      }
    })
  }, [markers])

  // Add a control with center buttons (HOME/WORK/SPOT) based on markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // remove existing control
    if (centerControlRef.current) {
      centerControlRef.current.remove()
      centerControlRef.current = null
    }

    // collect available targets
    const targets: Array<{ id: string; label: string; pos: { lat: number; lng: number } }> = []

    // HOME/WORK first (if present)
    const homeSpec = markers.find((m) => m.id === 'home')
    if (homeSpec) targets.push({ id: 'home', label: 'HOME', pos: homeSpec.position })
    const workSpec = markers.find((m) => m.id === 'work')
    if (workSpec) targets.push({ id: 'work', label: 'WORK', pos: workSpec.position })

    // Then all SPOTs, numbered in the order provided by markers
    const spotMarkers = markers.filter((m) => m.id === 'frequent' || m.id.startsWith('frequent-'))
    spotMarkers.forEach((m, idx) => {
      targets.push({ id: m.id, label: `SPOT ${idx + 1}`, pos: m.position })
    })

    if (!targets.length) return

    const Ctr = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'leaflet-bar center-control')
        const inner = L.DomUtil.create('div', 'center-buttons', div)
        targets.forEach((t) => {
          const btn = L.DomUtil.create('button', `center-btn ${t.id}`, inner)
          btn.innerHTML = t.label
          btn.title = `Centruj na ${t.label}`
          // Prevent map drag while clicking
          L.DomEvent.disableClickPropagation(btn)
          L.DomEvent.on(btn, 'click', () => {
            map.setView([t.pos.lat, t.pos.lng], Math.max(map.getZoom(), 14))
          })
        })
        return div
      },
      onRemove: () => {}
    })
    const ctrl = new Ctr({ position: 'topleft' })
    centerControlRef.current = ctrl
    ctrl.addTo(map)
  }, [markers])

  // Sync polylines
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const desiredIds = new Set(polylines.map((p) => p.id))
    Object.keys(polylinesRef.current).forEach((id) => {
      if (!desiredIds.has(id)) {
        polylinesRef.current[id].remove()
        delete polylinesRef.current[id]
      }
    })

    polylines.forEach((p) => {
      const key = p.id
      const latlngs: LatLngExpression[] = p.positions.map((pt) => [pt.lat, pt.lng])
      if (!polylinesRef.current[key]) {
        const ln = L.polyline(latlngs, { color: p.color ?? '#1976d2', weight: 4, opacity: 0.7 }).addTo(map)
        polylinesRef.current[key] = ln
      } else {
        polylinesRef.current[key].setLatLngs(latlngs)
        polylinesRef.current[key].setStyle({ color: p.color ?? '#1976d2' })
      }
    })
  }, [polylines])

  // Sync circles
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const desiredIds = new Set(circles.map((c) => c.id))
    Object.keys(circlesRef.current).forEach((id) => {
      if (!desiredIds.has(id)) {
        circlesRef.current[id].remove()
        delete circlesRef.current[id]
      }
    })

    circles.forEach((c) => {
      const key = c.id
      const center: LatLngExpression = [c.center.lat, c.center.lng]
      const style: L.CircleMarkerOptions = {
        radius: c.radiusMeters,
        color: c.color ?? '#2e7d32',
        fillColor: c.fillColor ?? '#66bb6a',
        opacity: c.opacity ?? 0.8,
        fillOpacity: c.fillOpacity ?? 0.2,
        weight: c.weight ?? 2,
        dashArray: c.dashArray as any,
      } as any
      if (!circlesRef.current[key]) {
        const circle = L.circle(center, style).addTo(map)
        circlesRef.current[key] = circle
      } else {
        circlesRef.current[key].setLatLng(center)
        circlesRef.current[key].setRadius(c.radiusMeters)
        circlesRef.current[key].setStyle({
          color: c.color ?? '#2e7d32',
          fillColor: c.fillColor ?? '#66bb6a',
          opacity: c.opacity ?? 0.8,
          fillOpacity: c.fillOpacity ?? 0.2,
          weight: c.weight ?? 2,
          dashArray: c.dashArray as any,
        } as any)
      }
    })
  }, [circles])

  // Sync GeoJSON layers (isochrones, parks)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const desiredIds = new Set(geoJsonLayers.map((g) => g.id))
    Object.keys(geoJsonRef.current).forEach((id) => {
      if (!desiredIds.has(id)) {
        geoJsonRef.current[id].remove()
        delete geoJsonRef.current[id]
      }
    })

    geoJsonLayers.forEach((g) => {
      const key = g.id
      if (!geoJsonRef.current[key]) {
        const layer = L.geoJSON(g.data as any, {
          style: (g.style as any) ?? { color: '#ff6f00', weight: 2, fillOpacity: 0.15 },
          onEachFeature: g.onEachFeature as any,
          pointToLayer: g.pointToLayer as any,
        }).addTo(map)
        geoJsonRef.current[key] = layer
      } else {
        const layer = geoJsonRef.current[key]
        layer.clearLayers()
        layer.addData(g.data as any)
        if (g.style) (layer as any).setStyle(g.style as any)
        if (g.onEachFeature) {
          // Re-apply handlers by iterating layers
          (layer as any).eachLayer((l: any) => {
            if (l.feature) g.onEachFeature!(l.feature, l)
          })
        }
      }
    })
  }, [geoJsonLayers])

  return <div ref={containerRef} className={className} style={{ width: '100%', height }} />
}
