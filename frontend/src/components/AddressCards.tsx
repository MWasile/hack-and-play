interface Loc { lat: number; lng: number; label?: string | null }

interface Props {
  home?: Loc | null
  work?: Loc | null
  frequent?: Loc | null
  frequentList?: Loc[] // New: multiple frequent spots
}

export default function AddressCards({ home, work, frequent, frequentList }: Props) {
  const spots = (frequentList && frequentList.length ? frequentList : (frequent ? [frequent] : []))
  return (
    <div className="address-cards">
      {home && (
        <div className="address-card">
          <div className="badge" style={{ background: 'var(--accent-home)' }}>HOME</div>
          <div className="big">{home.label ?? 'Lokalizacja bazowa'}</div>
          <div className="muted">{home.lat.toFixed(5)}, {home.lng.toFixed(5)}</div>
        </div>
      )}
      {work && (
        <div className="address-card">
          <div className="badge" style={{ background: 'var(--accent-work)' }}>WORK</div>
          <div className="big">{work.label ?? 'Praca/Uczelnia'}</div>
          <div className="muted">{work.lat.toFixed(5)}, {work.lng.toFixed(5)}</div>
        </div>
      )}
      {spots.map((s, i) => (
        <div className="address-card" key={i}>
          <div className="badge" style={{ background: 'var(--accent-frequent)' }}>{`SPOT ${i + 1}`}</div>
          <div className="big">{s.label ?? 'Często odwiedzana'}</div>
          <div className="muted">{s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>
        </div>
      ))}
    </div>
  )
}
