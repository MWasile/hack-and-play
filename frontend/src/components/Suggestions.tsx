interface Props {
  suggestedDistricts: string[]
  suggestedStreets: string[]
  selectedDistricts: string[]
  onToggleDistrict: (name: string) => void
  onAddStreetByName: (name: string) => void
}

export default function Suggestions({ suggestedDistricts, suggestedStreets, selectedDistricts, onToggleDistrict, onAddStreetByName }: Props) {
  if (suggestedDistricts.length === 0 && suggestedStreets.length === 0) return null
  return (
    <div className="suggestions">
      <h3 className="title">💡 Sugestie w okolicy</h3>
      {suggestedDistricts.length > 0 && (
        <div className="suggest-group">
          <div className="label">Dzielnice w pobliżu</div>
          <div className="chip-row">
            {suggestedDistricts.map((name) => (
              <button
                key={name}
                className={"chip" + (selectedDistricts.includes(name) ? ' active' : '')}
                onClick={() => onToggleDistrict(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
      {suggestedStreets.length > 0 && (
        <div className="suggest-group">
          <div className="label">Ulice w pobliżu</div>
          <div className="chip-row">
            {suggestedStreets.map((name) => (
              <button
                key={name}
                className="chip"
                onClick={() => onAddStreetByName(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

