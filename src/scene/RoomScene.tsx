import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Outline, Selection } from '@react-three/postprocessing'
import type { BloomEffect } from 'postprocessing'
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Box3, Color, MathUtils, Vector3, type DirectionalLight, type HemisphereLight, type PointLight } from 'three'
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
import { ThemeContext, type Mode } from './theme-context'
import { CAMERA_BOUNDS, FOV, homeView, VIEWS } from './views'

type LightSet = { hemi: number; sun: number; fill: number; point: number; bloom: number }
const NIGHT: LightSet = { hemi: 2.6, sun: 1.1, fill: 1.5, point: 1.2, bloom: 0.55 }
const DAY: LightSet = { hemi: 4.2, sun: 3.6, fill: 2.2, point: 0, bloom: 0.12 }
const COLORS = {
  sky: [new Color('#7a82e0'), new Color('#bcd4f0')],
  ground: [new Color('#3a2a60'), new Color('#b9a58c')],
  sun: [new Color('#ff5ae0'), new Color('#fff1d6')],
  fill: [new Color('#b4c2ff'), new Color('#ffffff')],
  background: [new Color('#05060a'), new Color('#a9bbd6')],
}

function setBloom(effect: BloomEffect | null, intensity: number) {
  if (effect) effect.intensity = intensity
}

// Nachts: wenig Grundhelligkeit, dazu farbiges Licht von Stadt und LEDs.
// Tagsüber: warmes Sonnenlicht durch die Balkontür. Der Übergang blendet weich über.
function Lights({ mode, bloom }: { mode: Mode; bloom: RefObject<BloomEffect | null> }) {
  const hemi = useRef<HemisphereLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const fill = useRef<DirectionalLight>(null)
  const cyan = useRef<PointLight>(null)
  const magenta = useRef<PointLight>(null)
  const t = useRef(0)
  const { scene, invalidate } = useThree((s) => ({ scene: s.scene, invalidate: s.invalidate }))

  useFrame((_, delta) => {
    const goal = mode === 'tag' ? 1 : 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const settled = Math.abs(goal - t.current) < 0.001
    if (settled && t.current === goal) return
    t.current = reduced || settled ? goal : MathUtils.damp(t.current, goal, 3, Math.min(delta, 0.05))
    const k = t.current
    const mix = (key: keyof LightSet) => MathUtils.lerp(NIGHT[key], DAY[key], k)
    if (hemi.current) {
      hemi.current.intensity = mix('hemi')
      hemi.current.color.lerpColors(COLORS.sky[0], COLORS.sky[1], k)
      hemi.current.groundColor.lerpColors(COLORS.ground[0], COLORS.ground[1], k)
    }
    if (sun.current) {
      sun.current.intensity = mix('sun')
      sun.current.color.lerpColors(COLORS.sun[0], COLORS.sun[1], k)
    }
    if (fill.current) {
      fill.current.intensity = mix('fill')
      fill.current.color.lerpColors(COLORS.fill[0], COLORS.fill[1], k)
    }
    if (cyan.current) cyan.current.intensity = mix('point')
    if (magenta.current) magenta.current.intensity = mix('point')
    setBloom(bloom.current, mix('bloom'))
    if (scene.background instanceof Color) scene.background.lerpColors(COLORS.background[0], COLORS.background[1], k)
    invalidate()
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#7a82e0', '#3a2a60', NIGHT.hemi]} />
      {/* Licht von draußen, das durch die Balkontür fällt: nachts Neon der Stadt, tagsüber Sonne */}
      <directionalLight
        ref={sun}
        position={[1.4, 3.6, -7]}
        intensity={NIGHT.sun}
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
      <directionalLight ref={fill} position={[1, 3.5, 6]} intensity={NIGHT.fill} color="#b4c2ff" />
      <pointLight ref={cyan} position={[-1.2, 1.4, 0]} intensity={NIGHT.point} distance={4.5} decay={1.6} color={NEON.cyan} />
      <pointLight ref={magenta} position={[1.2, 1.4, 0.5]} intensity={NIGHT.point} distance={4.5} decay={1.6} color={NEON.magenta} />
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
  const [mode, setMode] = useState<Mode>('nacht')
  const bloom = useRef<BloomEffect>(null)
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
          <color attach="background" args={['#05060a']} />
          <Selection>
            <Lights mode={mode} bloom={bloom} />
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
              <Bloom ref={bloom} mipmapBlur intensity={0.55} luminanceThreshold={0.9} luminanceSmoothing={0.15} />
            </EffectComposer>
          </Selection>
          <HotspotProjector refs={hotspotRefs} />
          <CameraRig active={active} />
        </InteractionContext.Provider>
        </ThemeContext.Provider>
      </Canvas>
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
