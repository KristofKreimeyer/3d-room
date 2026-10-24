import { Suspense, lazy, useEffect, useState } from 'react'
import { QuickView } from './components/QuickView'
import { TopBar, type View } from './components/TopBar'

// Die 3D-Szene wird erst bei Bedarf geladen, damit die Schnellansicht sofort da ist.
const RoomScene = lazy(() => import('./scene/RoomScene'))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function initialView(canShow3d: boolean): View {
  const params = new URLSearchParams(window.location.search)
  if (params.get('ansicht') === 'liste') return 'liste'
  // Ein Direktlink auf einen Abschnitt (z. B. #projekte) öffnet gleich die Schnellansicht.
  if (window.location.hash) return 'liste'
  return canShow3d ? '3d' : 'liste'
}

export default function App() {
  const [canShow3d] = useState(supportsWebGL)
  const [view, setView] = useState<View>(() => initialView(canShow3d))

  useEffect(() => {
    if (view === 'liste' && window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView()
    }
  }, [view])

  return (
    <>
      <TopBar view={view} canShow3d={canShow3d} onViewChange={setView} />
      {view === '3d' ? (
        <Suspense fallback={(
            <div className="scene__loading" role="status">
              <span className="scene__spinner" aria-hidden="true" />
              Raum wird geladen …
            </div>
          )}>
          <RoomScene />
        </Suspense>
      ) : (
        <QuickView />
      )}
    </>
  )
}
