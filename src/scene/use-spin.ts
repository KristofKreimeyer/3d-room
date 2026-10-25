import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type Group } from 'three'

function setCursor(e: ThreeEvent<PointerEvent>, cursor: string) {
  if (e.nativeEvent.target instanceof HTMLElement) e.nativeEvent.target.style.cursor = cursor
}

// Ein Klick dreht ein Objekt einmal um die eigene Achse. Bei reduzierter Bewegung bleibt es stehen.
export function useSpin() {
  const ref = useRef<Group>(null)
  const target = useRef(0)
  const invalidate = useThree((s) => s.invalidate)

  useFrame((_, delta) => {
    const g = ref.current
    if (!g || Math.abs(target.current - g.rotation.y) < 0.002) return
    // Bei Rendern auf Abruf kann das erste Delta groß sein, deshalb begrenzen.
    g.rotation.y = MathUtils.damp(g.rotation.y, target.current, 3.5, Math.min(delta, 0.05))
    invalidate()
  })

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (e.delta > 4) return
      e.stopPropagation()
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const g = ref.current
      if (!g) return
      target.current = Math.max(target.current, g.rotation.y) + Math.PI * 2
      invalidate()
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => setCursor(e, 'pointer'),
    onPointerOut: (e: ThreeEvent<PointerEvent>) => setCursor(e, ''),
  }

  return { ref, handlers }
}
