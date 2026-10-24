import { CameraControls, CameraControlsImpl, useProgress } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Outline, Selection } from '@react-three/postprocessing'
import type { BloomEffect } from 'postprocessing'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box3, Vector3 } from 'three'
import { InfoPanel } from '../components/InfoPanel'
import type { SectionId } from '../content'
import { BakedRoom } from './BakedRoom'
import { Hotspots, HotspotProjector, type HotspotRefs } from './Hotspots'
import { InteractionContext } from './interaction-context'
import { ThemeContext, type Mode } from './theme-context'
import { CAMERA_BOUNDS, FOV, homeView, VIEWS } from './views'

const ProceduralRoom = lazy(() => import('./ProceduralRoom'))

const { ACTION } = CameraControlsImpl

const BOUNDS = new Box3(new Vector3(...CAMERA_BOUNDS.min), new Vector3(...CAMERA_BOUNDS.max))

function confine(controls: CameraControlsImpl) {
  controls.setBoundary(BOUNDS)
  controls.boundaryEnclosesCamera = true
  controls.boundaryFriction = 0
}

// Kamera: Drehen und Zoomen mit Grenzen, dazu sanfte Fahrten zu den Objekten.
function CameraRig({ active }: { active: SectionId | null }) {
  const controls = useThree((s) => s.controls) as CameraControlsImpl | null
  const started = useRef(false)

  useEffect(() => {
    if (!controls) return
    // Weder Kamera noch Blickpunkt verlassen den Raum, auch nicht beim Zoomen oder bei Kamerafahrten.
    confine(controls)
    const view = active ? VIEWS[active] : homeView()
    // Die erste Position wird gesetzt, ohne dass die Kamera dorthin fährt.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animate = started.current && !reduced
    started.current = true
    void controls.setLookAt(...view.position, ...view.target, animate)
  }, [controls, active])

  return (
    <CameraControls
      makeDefault
      minDistance={1.2}
      maxDistance={7}
      minPolarAngle={0.5}
      maxPolarAngle={Math.PI / 2.05}
      minAzimuthAngle={-1.25}
      maxAzimuthAngle={1.25}
      truckSpeed={0}
      dollySpeed={0.6}
      smoothTime={0.3}
      mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.DOLLY }}
      touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
    />
  )
}

export default function RoomScene() {
  const [active, setActive] = useState<SectionId | null>(null)
  const [hovered, setHovered] = useState<SectionId | null>(null)
  const [mode, setMode] = useState<Mode>('nacht')
  const bloom = useRef<BloomEffect>(null)
  const { progress } = useProgress()
  const procedural = useMemo(() => new URLSearchParams(window.location.search).get('szene') === 'prozedural', [])
  const trigger = useRef<HTMLElement | null>(null)
  const hotspotRefs: HotspotRefs = useRef({})

  const pick = useCallback((id: SectionId) => {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setActive(id)
  }, [])
  const close = useCallback(() => {
    setActive(null)
    // Wer per Tastatur geöffnet hat, landet wieder am Hotspot.
    if (trigger.current?.isConnected && trigger.current.classList.contains('hotspot')) trigger.current.focus()
  }, [])

  const interaction = useMemo(() => ({ hovered, setHovered, pick }), [hovered, pick])
  const portrait = window.innerWidth / window.innerHeight < 0.8
  const start = homeView()

  return (
    <div id="inhalt" className="scene" role="region" aria-label="3D-Ansicht des Arbeitszimmers">
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: start.position, fov: portrait ? FOV.portrait : FOV.landscape }}
      >
        <ThemeContext.Provider value={mode}>
        <InteractionContext.Provider value={interaction}>
          <color attach="background" args={['#15100d']} />
          <Selection>
            {procedural ? (
              <Suspense fallback={null}>
                <ProceduralRoom mode={mode} bloom={bloom} />
              </Suspense>
            ) : (
              <BakedRoom />
            )}
            <EffectComposer autoClear={false}>
              <Outline blur edgeStrength={6} width={600} visibleEdgeColor={0xffd9a0} hiddenEdgeColor={0xffd9a0} />
              <Bloom ref={bloom} mipmapBlur intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.15} />
            </EffectComposer>
          </Selection>
          <HotspotProjector refs={hotspotRefs} />
          <CameraRig active={active} />
        </InteractionContext.Provider>
        </ThemeContext.Provider>
      </Canvas>
      {!procedural && progress < 100 && (
        <div className="scene__loading scene__loading--overlay" role="status">
          <span className="scene__spinner" aria-hidden="true" />
          Raum wird geladen … {Math.round(progress)} %
        </div>
      )}
      <button
        type="button"
        className="scene__mode"
        aria-pressed={mode === 'tag'}
        onClick={() => setMode(mode === 'tag' ? 'nacht' : 'tag')}
      >
        Tageslicht
      </button>
      <Hotspots refs={hotspotRefs} hovered={hovered} activeId={active} onHover={setHovered} onPick={pick} />
      {active ? (
        <InfoPanel id={active} onClose={close} />
      ) : (
        <p className="scene__hint">
          Ziehen zum Umsehen, scrollen zum Zoomen. Tippe auf die leuchtenden Punkte oder Objekte, um Inhalte zu öffnen.
        </p>
      )}
    </div>
  )
}
