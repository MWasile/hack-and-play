import { useEffect, useRef, useState } from 'react'

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

export default function AddressAutocomplete({ placeholder, value, onChange, onSelect, className, autoFocus }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const debounced = useDebounced(value, 300)
  const rootRef = useRef<HTMLDivElement | null>(null)

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
          setItems(data.map(d => ({ lat: Number(d.lat), lng: Number(d.lon), label: d.display_name })))
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
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

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

  return (
    <div className={`ac-root ${className ?? ''}`} ref={rootRef}>
      <input
        className="ac-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => (items.length > 0 || loading) && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      {open && (loading || items.length > 0) && (
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
      )}
    </div>
  )
}
