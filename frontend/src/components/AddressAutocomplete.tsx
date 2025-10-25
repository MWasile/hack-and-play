import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

type Suggestion = {
  lat: number
  lng: number
  label: string
}

interface Props {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  onSelect: (s: Suggestion) => void
  className?: string
  autoFocus?: boolean
}

function useDebounced<T>(val: T, delay = 300) {
  const [v, setV] = useState(val)
  useEffect(() => {
    const id = setTimeout(() => setV(val), delay)
    return () => clearTimeout(id)
  }, [val, delay])
  return v
}

function cleanDisplayName(name: string): string {
  const parts = name.split(',').map(p => p.trim())
  const filtered = parts.filter(p => {
    if (!p) return false
    const lower = p.toLowerCase()
    // Omit country
    if (lower === 'polska' || lower === 'poland') return false
    // Omit voivodeship (province)
    if (lower.startsWith('województwo')) return false
    // Omit postal code like 03-140
    if (/^[0-9]{2}-[0-9]{3}$/.test(p)) return false
    return true
  })
  return filtered.join(', ')
}

export default function AddressAutocomplete({ placeholder, value, onChange, onSelect, className, autoFocus }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const debounced = useDebounced(value, 300)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)
  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    let cancelled = false
    async function run() {
      const q = (debounced ?? '').trim()
      if (!q || q.length < 3) {
        setItems([])
        setLoading(false)
        setOpen(false) // close when query is too short
        return
      }
      setLoading(true)
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('format', 'jsonv2')
      url.searchParams.set('addressdetails', '0')
      url.searchParams.set('limit', '5')
      url.searchParams.set('q', q)
      try {
        const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } })
        if (!res.ok) return
        const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>
        if (!cancelled) {
          setItems(data.map(d => ({ lat: Number(d.lat), lng: Number(d.lon), label: cleanDisplayName(d.display_name) })))
          setActive(0)
          // DO NOT auto-open here. Visibility is controlled by focus/open state.
        }
      } catch {}
      finally { if (!cancelled) setLoading(false) }
    }
    run()
    return () => { cancelled = true }
  }, [debounced])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      const rootEl = rootRef.current
      const portalEl = portalRef.current
      if (!rootEl && !portalEl) return
      const insideRoot = !!(rootEl && rootEl.contains(target))
      const insidePortal = !!(portalEl && portalEl.contains(target))
      if (!insideRoot && !insidePortal) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick, true)
    return () => document.removeEventListener('mousedown', onDocClick, true)
  }, [])

  // Position the portal under the input
  useLayoutEffect(() => {
    if (!open) return
    const el = inputRef.current
    if (!el) return

    let frame = 0
    const update = () => {
      const r = el.getBoundingClientRect()
      setPortalPos({ top: r.bottom, left: r.left, width: r.width })
    }
    update()

    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    const onResize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    // Use a guarded constructor instead of optional chaining with new
    const RO = (window as any).ResizeObserver as (new (cb: ResizeObserverCallback) => ResizeObserver) | undefined
    const ro = RO ? new RO(() => onResize()) : undefined
    ro?.observe(el)

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      ro?.disconnect?.()
      cancelAnimationFrame(frame)
    }
  }, [open, items.length, loading])

  function choose(index: number) {
    const s = items[index]
    if (!s) return
    onSelect(s)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!(open && items.length > 0)) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(items.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(active)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const shouldShow = open && (loading || items.length > 0)

  return (
    <div className={`ac-root ${className ?? ''}`} ref={rootRef}>
      <input
        ref={inputRef}
        className="ac-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => (items.length > 0 || loading) && setOpen(true)}
        // onBlur removed; outside-click handler controls closing including portal content
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      {shouldShow && inputRef.current && createPortal(
        <div
          ref={portalRef}
          style={{
            position: 'fixed',
            top: portalPos.top,
            left: portalPos.left,
            width: portalPos.width,
            zIndex: 10000,
          }}
        >
          <div className="ac-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`skel-${i}`} className="ac-item skeleton" aria-hidden>
                  <span className="ac-skel-line" />
                </div>
              ))
            ) : (
              items.map((it, i) => (
                <button
                  key={`${it.lat}-${it.lng}-${i}`}
                  type="button"
                  className={`ac-item ${i === active ? 'active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  title={it.label}
                >
                  <span className="ac-item-title">{it.label}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
