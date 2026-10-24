import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type PointLight } from 'three'
import { useMode } from '../theme-context'

type Props = {
  night: number
  day: number
  position: [number, number, number]
  color: string
  distance: number
  decay?: number
}

// Punktlicht, das beim Wechsel zwischen Nacht und Tag weich seine Helligkeit ändert.
export function ModeLight({ night, day, position, color, distance, decay = 2 }: Props) {
  const mode = useMode()
  const light = useRef<PointLight>(null)
  const t = useRef(mode === 'tag' ? 1 : 0)
  const invalidate = useThree((s) => s.invalidate)

  useFrame((_, delta) => {
    const goal = mode === 'tag' ? 1 : 0
    if (!light.current || t.current === goal) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = MathUtils.damp(t.current, goal, 3, Math.min(delta, 0.05))
    t.current = reduced || Math.abs(goal - next) < 0.001 ? goal : next
    light.current.intensity = MathUtils.lerp(night, day, t.current)
    invalidate()
  })

  return (
    <pointLight
      ref={light}
      position={position}
      intensity={mode === 'tag' ? day : night}
      distance={distance}
      decay={decay}
      color={color}
    />
  )
}
