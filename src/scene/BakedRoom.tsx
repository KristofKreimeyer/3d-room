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
// Bildschirme, Whiteboard und Himmel bleiben als eigene Bildflächen (images.glb), damit ihr Inhalt scharf ist.
const BASE = `${import.meta.env.BASE_URL}room/`
const PARTS = [
  'shell', 'desk', 'lowshelves', 'drums', 'shelf', 'monitor', 'smartphone', 'whiteboard', 'chair', 'poster0', 'poster1',
] as const
type Part = (typeof PARTS)[number]
type ImagePart = 'monitor_img' | 'smartphone_img' | 'whiteboard_img' | 'sky_img'

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

function basic(map: Texture) {
  return new MeshBasicMaterial({ map, toneMapped: false })
}

// Der Tag liegt als durchscheinende zweite Schicht über der Nacht und blendet weich ein.
function overlay(map: Texture) {
  return new MeshBasicMaterial({ map, toneMapped: false, transparent: true, opacity: 0, depthWrite: false, visible: false })
}

type Geo = { geometry: BufferGeometry; material?: { map: Texture | null } }

export function BakedRoom() {
  const mode = useMode()
  const { nodes } = useGLTF(`${BASE}room.glb`)
  const images = useGLTF(`${BASE}images.glb`).nodes
  const onLoad = (t: Texture | Texture[]) => [t].flat().forEach(prepare)
  const night = useTexture(PARTS.map((p) => `${BASE}${p}_night.jpg`), onLoad)
  const day = useTexture(PARTS.map((p) => `${BASE}${p}_day.jpg`), onLoad)
  const sky = useTexture([`${BASE}sky_night.png`, `${BASE}sky_day.png`], onLoad)

  const materials = useMemo(() => {
    const parts = Object.fromEntries(PARTS.map((p, i) => [p, { night: basic(night[i]), day: overlay(day[i]) }]))
    const skyPair = { night: basic(sky[0]), day: overlay(sky[1]) }
    const pictures = Object.fromEntries(
      (['monitor_img', 'smartphone_img', 'whiteboard_img'] as const).map((n) => {
        const map = (images[n] as unknown as Geo).material?.map
        return [n, map ? basic(map) : null]
      }),
    )
    return { parts, skyPair, pictures }
  }, [night, day, sky, images])
  const overlays = useMemo(
    () => [...Object.values(materials.parts).map((m) => m.day), materials.skyPair.day],
    [materials],
  )

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
    const { geometry } = nodes[name] as unknown as Geo
    const pair = materials.parts[name]
    return (
      <>
        <mesh geometry={geometry} material={pair.night} />
        <mesh geometry={geometry} material={pair.day} renderOrder={1} raycast={() => null} />
      </>
    )
  }
  const picture = (name: ImagePart) => {
    const { geometry } = images[name] as unknown as Geo
    if (name === 'sky_img') {
      return (
        <>
          <mesh geometry={geometry} material={materials.skyPair.night} raycast={() => null} />
          <mesh geometry={geometry} material={materials.skyPair.day} renderOrder={1} raycast={() => null} />
        </>
      )
    }
    return <mesh geometry={geometry} material={materials.pictures[name] ?? undefined} />
  }

  const { ref: chairRef, handlers: chairHandlers } = useSpin()
  const pivot: [number, number, number] = [DESK.x + 0.85, 0, DESK.z + 0.25]
  const place = (children: ReactNode) => <group position={pivot}>{children}</group>

  return (
    <>
      {layer('shell')}
      {picture('sky_img')}
      {layer('poster0')}
      {layer('poster1')}
      {layer('desk')}
      {layer('lowshelves')}
      {layer('drums')}
      <Interactive id="projekte">
        {layer('monitor')}
        {picture('monitor_img')}
      </Interactive>
      <Interactive id="kontakt">
        {layer('smartphone')}
        {picture('smartphone_img')}
      </Interactive>
      <Interactive id="skills">
        {layer('whiteboard')}
        {picture('whiteboard_img')}
      </Interactive>
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
useGLTF.preload(`${BASE}images.glb`)
