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
}

function useDebounced<T>(val: T, delay = 300) {
  const [v, setV] = useState(val)
  useEffect(() => {
    const id = setTimeout(() => setV(val), delay)
    return () => clearTimeout(id)
  }, [val, delay])
  return v
}

export default function AddressAutocomplete({ placeholder, value, onChange, onSelect, className }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const [active, setActive] = useState(0)
  const debounced = useDebounced(value, 300)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!debounced || debounced.trim().length < 3) {
        setItems([])
        return
      }
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('format', 'jsonv2')
      url.searchParams.set('addressdetails', '0')
      url.searchParams.set('limit', '5')
      url.searchParams.set('q', debounced)
      try {
        const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } })
        if (!res.ok) return
        const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>
        if (!cancelled) {
          setItems(data.map(d => ({ lat: Number(d.lat), lng: Number(d.lon), label: d.display_name })))
          setOpen(true)
          setActive(0)
        }
      } catch {}
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
    if (!open || items.length === 0) return
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
        onFocus={() => items.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && items.length > 0 && (
        <div className="ac-list">
          {items.map((it, i) => (
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
          ))}
        </div>
      )}
    </div>
  )
}
