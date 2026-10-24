import type { ThreeEvent } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import type { ReactNode } from 'react'
import type { SectionId } from '../content'
import { useInteraction } from './interaction-context'

function setCursor(event: Event, cursor: string) {
  if (event.target instanceof HTMLElement) event.target.style.cursor = cursor
}

// Macht ein Objekt im Raum klickbar: Hover lässt es leuchten (Outline), Klick öffnet den Bereich.
export function Interactive({ id, children }: { id: SectionId; children: ReactNode }) {
  const { hovered, setHovered, pick } = useInteraction()

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(id)
    setCursor(e.nativeEvent, 'pointer')
  }
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    setHovered(null)
    setCursor(e.nativeEvent, '')
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // Ein Ziehen zum Drehen der Ansicht soll nicht als Klick zählen.
    if (e.delta > 4) return
    e.stopPropagation()
    pick(id)
  }

  return (
    <Select enabled={hovered === id} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      {children}
    </Select>
  )
}
