import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import { Vector3 } from 'three'
import type { SectionId } from '../content'
import { HOTSPOTS } from './views'

export type HotspotRefs = MutableRefObject<Partial<Record<SectionId, HTMLButtonElement | null>>>

const point = new Vector3()

function place(el: HTMLElement, x: number, y: number, hidden: boolean) {
  el.style.visibility = hidden ? 'hidden' : 'visible'
  el.style.transform = `translate(${x}px, ${y}px)`
}

// Läuft im Canvas und schiebt die Hotspot-Buttons bei jedem gerenderten Bild an die Bildschirmposition ihres Objekts.
export function HotspotProjector({ refs }: { refs: HotspotRefs }) {
  useFrame(({ camera, size }) => {
    for (const h of HOTSPOTS) {
      const el = refs.current[h.id]
      if (!el) continue
      point.set(...h.anchor).project(camera)
      place(el, (point.x * 0.5 + 0.5) * size.width, (-point.y * 0.5 + 0.5) * size.height, point.z > 1)
    }
  })
  return null
}

type Props = {
  refs: HotspotRefs
  hovered: SectionId | null
  activeId: SectionId | null
  onHover: (id: SectionId | null) => void
  onPick: (id: SectionId) => void
}

// Leuchtende Punkte an den klickbaren Objekten. Es sind echte Buttons, damit der Raum
// auch per Tastatur und Screenreader bedienbar ist.
export function Hotspots({ refs, hovered, activeId, onHover, onPick }: Props) {
  return (
    <>
      {HOTSPOTS.map((h) => (
        <button
          key={h.id}
          ref={(el) => {
            refs.current[h.id] = el
          }}
          type="button"
          className="hotspot"
          data-active={hovered === h.id || activeId === h.id}
          aria-label={`${h.label} öffnen (${h.object})`}
          onClick={() => onPick(h.id)}
          onMouseEnter={() => onHover(h.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(h.id)}
          onBlur={() => onHover(null)}
        >
          <span className="hotspot__dot" aria-hidden="true" />
          <span className="hotspot__label">{h.label}</span>
        </button>
      ))}
    </>
  )
}
