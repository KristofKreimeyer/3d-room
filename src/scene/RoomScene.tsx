import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Outline, Selection } from '@react-three/postprocessing'
import { Box3, Vector3 } from 'three'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { InfoPanel } from '../components/InfoPanel'
import type { SectionId } from '../content'
import { Desk } from './room/Desk'
import { Drums } from './room/Drums'
import { Chair, LowShelves, Shelf, Whiteboard } from './room/Furniture'
import { NEON } from './room/neon'
import { Structure } from './room/Structure'
import { Hotspots, HotspotProjector, type HotspotRefs } from './Hotspots'
import { Interactive } from './Interactive'
import { InteractionContext } from './interaction-context'
import { CAMERA_BOUNDS, FOV, homeView, VIEWS } from './views'

// Nachtlicht: wenig Grundhelligkeit, dazu farbiges Licht von Stadt und LEDs.
function Lights() {
  return (
    <>
      <hemisphereLight args={['#7a82e0', '#3a2a60', 2.6]} />
      {/* Neonlicht der Stadt, das durch die Balkontür fällt */}
      <directionalLight
        position={[1.4, 3.6, -7]}
        intensity={1.1}
        color="#ff5ae0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-far={14}
      />
      {/* Kühle Aufhellung von vorn, damit keine Ecke absäuft */}
      <directionalLight position={[1, 3.5, 6]} intensity={1.5} color="#b4c2ff" />
      <pointLight position={[-1.2, 1.4, 0]} intensity={1.2} distance={4.5} decay={1.6} color={NEON.cyan} />
      <pointLight position={[1.2, 1.4, 0.5]} intensity={1.2} distance={4.5} decay={1.6} color={NEON.magenta} />
    </>
  )
}

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
        <InteractionContext.Provider value={interaction}>
          <color attach="background" args={['#05060a']} />
          <Selection>
            <Lights />
            <Structure />
            <Desk />
            <Interactive id="skills">
              <Whiteboard />
            </Interactive>
            <Interactive id="ueber-mich">
              <Shelf />
            </Interactive>
            <LowShelves />
            <Drums />
            <Chair />
            <EffectComposer autoClear={false}>
              <Outline blur edgeStrength={6} width={600} visibleEdgeColor={0x19e6ff} hiddenEdgeColor={0x19e6ff} />
              <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.9} luminanceSmoothing={0.15} />
            </EffectComposer>
          </Selection>
          <HotspotProjector refs={hotspotRefs} />
          <CameraRig active={active} />
        </InteractionContext.Provider>
      </Canvas>
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
