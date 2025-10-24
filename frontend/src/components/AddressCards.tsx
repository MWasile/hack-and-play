interface Loc { lat: number; lng: number; label?: string | null }

interface Props {
  home?: Loc | null
  work?: Loc | null
  frequent?: Loc | null
}

export default function AddressCards({ home, work, frequent }: Props) {
  return (
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
  )
}

