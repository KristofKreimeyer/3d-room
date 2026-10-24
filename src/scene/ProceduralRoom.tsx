import { useFrame, useThree } from '@react-three/fiber'
import type { BloomEffect } from 'postprocessing'
import { useEffect, useRef, type RefObject } from 'react'
import { Color, MathUtils, type DirectionalLight, type HemisphereLight } from 'three'
import { Desk } from './room/Desk'
import { Drums } from './room/Drums'
import { Chair, LowShelves, Shelf, Whiteboard } from './room/Furniture'
import { Structure } from './room/Structure'
import { Interactive } from './Interactive'
import type { Mode } from './theme-context'

type LightSet = { hemi: number; sun: number; fill: number; bloom: number }
const NIGHT: LightSet = { hemi: 1.1, sun: 0.9, fill: 0.55, bloom: 0.3 }
const DAY: LightSet = { hemi: 3.2, sun: 3.6, fill: 1.6, bloom: 0.08 }
const COLORS = {
  sky: [new Color('#d8b48a'), new Color('#fff1da')],
  ground: [new Color('#6b4a38'), new Color('#c9a98a')],
  sun: [new Color('#7f94d8'), new Color('#fff1d6')],
  fill: [new Color('#ffd7a8'), new Color('#fff6e8')],
  background: [new Color('#15100d'), new Color('#d9cdbd')],
}

function setBloom(effect: BloomEffect | null, intensity: number) {
  if (effect) effect.intensity = intensity
}

// Nachts: gedämpftes Raumlicht, die Lampen sorgen für Wärme.
// Tagsüber: warmes Sonnenlicht durch die Balkontür. Der Übergang blendet weich über.
function Lights({ mode, bloom }: { mode: Mode; bloom: RefObject<BloomEffect | null> }) {
  const hemi = useRef<HemisphereLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const fill = useRef<DirectionalLight>(null)
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
    setBloom(bloom.current, mix('bloom'))
    if (scene.background instanceof Color) scene.background.lerpColors(COLORS.background[0], COLORS.background[1], k)
    invalidate()
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#d8b48a', '#6b4a38', NIGHT.hemi]} />
      {/* Licht von draußen, das durch die Balkontür fällt: nachts Neon der Stadt, tagsüber Sonne */}
      <directionalLight
        ref={sun}
        position={[1.4, 3.6, -7]}
        intensity={NIGHT.sun}
        color="#7f94d8"
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
      <directionalLight ref={fill} position={[1, 3.5, 6]} intensity={NIGHT.fill} color="#ffd7a8" />
    </>
  )
}


// Die Szene aus Code: wird nur noch für den Blender-Export gebraucht (?szene=prozedural, siehe tools/blender).
// Die Seite selbst zeigt das gebackene Modell aus BakedRoom.
export default function ProceduralRoom({ mode, bloom }: { mode: Mode; bloom: RefObject<BloomEffect | null> }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    ;(window as unknown as { __scene: unknown }).__scene = scene
  }, [scene])

  return (
    <>
      <Lights mode={mode} bloom={bloom} />
      <group name="shell">
        <Structure />
      </group>
      <group name="desk">
        <Desk />
      </group>
      <Interactive id="skills">
        <Whiteboard />
      </Interactive>
      <Interactive id="ueber-mich">
        <group name="shelf">
          <Shelf />
        </group>
      </Interactive>
      <group name="lowshelves">
        <LowShelves />
      </group>
      <Drums />
      <group name="chair">
        <Chair />
      </group>
    </>
  )
}
