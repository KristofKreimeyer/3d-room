import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import { Color, MathUtils, MeshBasicMaterial, SRGBColorSpace, type BufferGeometry, type Texture } from 'three'
import { Interactive } from './Interactive'
import { DESK } from './room/layout'
import { useMode } from './theme-context'
import { useSpin } from './use-spin'

// Das Modell stammt aus Blender (tools/blender): pro Objektgruppe ein Mesh und je eine gebackene
// Lichttextur für Nacht und Tag. Die Texturen enthalten Licht, Schatten und Materialien, die Szene braucht kein Licht.
const BASE = `${import.meta.env.BASE_URL}room/`
const PARTS = ['shell', 'desk', 'lowshelves', 'drums', 'shelf', 'monitor', 'smartphone', 'whiteboard', 'chair'] as const
type Part = (typeof PARTS)[number]

const BACKGROUND = { nacht: new Color('#15100d'), tag: new Color('#d9cdbd') }

function prepare(tex: Texture) {
  // glTF-UVs erwarten Bilder ohne Spiegelung
  tex.flipY = false
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
}

function setOverlays(mats: MeshBasicMaterial[], t: number) {
  for (const m of mats) {
    m.opacity = t
    m.visible = t > 0.002
  }
}

function setBackground(background: unknown, t: number) {
  if (background instanceof Color) background.lerpColors(BACKGROUND.nacht, BACKGROUND.tag, t)
}

export function BakedRoom() {
  const mode = useMode()
  const { nodes } = useGLTF(`${BASE}room.glb`)
  const night = useTexture(PARTS.map((p) => `${BASE}${p}_night.jpg`), (t) => [t].flat().forEach(prepare))
  const day = useTexture(PARTS.map((p) => `${BASE}${p}_day.jpg`), (t) => [t].flat().forEach(prepare))

  const materials = useMemo(
    () =>
      PARTS.map((_, i) => ({
        night: new MeshBasicMaterial({ map: night[i], toneMapped: false }),
        // Der Tag liegt als durchscheinende zweite Schicht über der Nacht und blendet weich ein.
        day: new MeshBasicMaterial({
          map: day[i],
          toneMapped: false,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          visible: false,
        }),
      })),
    [night, day],
  )
  const overlays = useMemo(() => materials.map((m) => m.day), [materials])

  const t = useRef(mode === 'tag' ? 1 : 0)
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)
  useFrame((_, delta) => {
    const goal = mode === 'tag' ? 1 : 0
    if (t.current === goal) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = MathUtils.damp(t.current, goal, 3, Math.min(delta, 0.05))
    t.current = reduced || Math.abs(goal - next) < 0.001 ? goal : next
    setOverlays(overlays, t.current)
    setBackground(scene.background, t.current)
    invalidate()
  })

  const layer = (name: Part) => {
    const mesh = nodes[name] as unknown as { geometry: BufferGeometry }
    const i = PARTS.indexOf(name)
    return (
      <>
        <mesh geometry={mesh.geometry} material={materials[i].night} />
        <mesh geometry={mesh.geometry} material={materials[i].day} renderOrder={1} raycast={() => null} />
      </>
    )
  }

  const { ref: chairRef, handlers: chairHandlers } = useSpin()
  const pivot: [number, number, number] = [DESK.x + 0.85, 0, DESK.z + 0.25]
  const place = (children: ReactNode) => <group position={pivot}>{children}</group>

  return (
    <>
      {layer('shell')}
      {layer('desk')}
      {layer('lowshelves')}
      {layer('drums')}
      <Interactive id="projekte">{layer('monitor')}</Interactive>
      <Interactive id="kontakt">{layer('smartphone')}</Interactive>
      <Interactive id="skills">{layer('whiteboard')}</Interactive>
      <Interactive id="ueber-mich">{layer('shelf')}</Interactive>
      {/* Der Stuhl dreht sich um seine eigene Achse; das Mesh liegt in Weltkoordinaten und wird zurückgeschoben. */}
      {place(
        <group ref={chairRef} {...chairHandlers}>
          <group position={[-pivot[0], 0, -pivot[2]]}>{layer('chair')}</group>
        </group>,
      )}
    </>
  )
}

useGLTF.preload(`${BASE}room.glb`)
