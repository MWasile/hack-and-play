import { Home as HomeIcon, Briefcase, MapPin } from 'lucide-react'
import './address-cards.css'

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
        <div className="address-card card-home appear" aria-label="Karta: Dom">
          <div className="badge home" aria-hidden>
            <HomeIcon className="badge-icon" size={16} />
            <span>HOME</span>
          </div>
          <div className="big">{home.label ?? 'Lokalizacja bazowa'}</div>
          <div className="muted right">{home.lat.toFixed(5)}, {home.lng.toFixed(5)}</div>
        </div>
      )}
      {work && (
        <div className="address-card card-work appear" aria-label="Karta: Praca/Uczelnia">
          <div className="badge work" aria-hidden>
            <Briefcase className="badge-icon" size={16} />
            <span>WORK</span>
          </div>
          <div className="big">{work.label ?? 'Praca/Uczelnia'}</div>
          <div className="muted right">{work.lat.toFixed(5)}, {work.lng.toFixed(5)}</div>
        </div>
      )}
      {spots.map((s, i) => (
        <div className="address-card card-spot appear" key={i} aria-label={`Karta: Często odwiedzana ${i + 1}`}>
          <div className="badge spot" aria-hidden>
            <MapPin className="badge-icon" size={16} />
            <span>{`SPOT ${i + 1}`}</span>
          </div>
          <div className="big">{s.label ?? 'Często odwiedzana'}</div>
          <div className="muted">{s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>
        </div>
      ))}
    </div>
  )
}
