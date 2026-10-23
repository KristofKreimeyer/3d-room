import { profile, sections } from '../content'

export type View = '3d' | 'liste'

type Props = {
  view: View
  canShow3d: boolean
  onViewChange: (view: View) => void
}

// Feste Leiste mit Direktlinks. Sie ist in beiden Ansichten sichtbar,
// damit niemand erst den Raum erkunden muss, um an Inhalte zu kommen.
export function TopBar({ view, canShow3d, onViewChange }: Props) {
  return (
    <header className="topbar">
      <a className="skip-link" href="#inhalt" onClick={() => onViewChange('liste')}>
        Zum Inhalt springen
      </a>
      <span className="topbar__name">{profile.name}</span>
      <nav aria-label="Direktlinks">
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={() => onViewChange('liste')}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {canShow3d && (
        <button
          type="button"
          className="topbar__toggle"
          onClick={() => onViewChange(view === '3d' ? 'liste' : '3d')}
        >
          {view === '3d' ? 'Schnellansicht' : '3D-Raum'}
        </button>
      )}
    </header>
  )
}
