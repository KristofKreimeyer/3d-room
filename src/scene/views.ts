import type { SectionId } from '../content'

type Vec3 = [number, number, number]
export type View = { position: Vec3; target: Vec3 }

// Startansicht: von der Zimmertür aus. Hochformat startet weiter weg.
export function homeView(): View {
  const portrait = window.innerWidth / window.innerHeight < 0.8
  return {
    position: portrait ? [0.3, 2.2, 5.6] : [0.8, 2.3, 4.3],
    target: [0, 1.1, -1],
  }
}

export const FOV = { portrait: 66, landscape: 58 }

// Kamerafahrten zu den klickbaren Objekten. Jede Ansicht bleibt innerhalb der Azimut-Grenzen (±1,25 rad).
export const VIEWS: Record<SectionId, View> = {
  projekte: { position: [0.05, 1.5, -0.4], target: [-1.45, 1.2, -1.3] },
  skills: { position: [-0.2, 1.7, -0.7], target: [-1.55, 1.85, -2.0] },
  kontakt: { position: [0.1, 1.4, -0.9], target: [-0.98, 0.8, -1.65] },
  'ueber-mich': { position: [-0.5, 1.5, 1.0], target: [1.35, 1.0, -0.15] },
}

// Position der leuchtenden Hotspot-Punkte.
export const HOTSPOTS: { id: SectionId; label: string; object: string; anchor: Vec3 }[] = [
  { id: 'projekte', label: 'Projekte', object: 'Monitor', anchor: [-1.4, 1.55, -1.3] },
  { id: 'skills', label: 'Skills', object: 'Whiteboard', anchor: [-1.5, 2.0, -2.0] },
  { id: 'kontakt', label: 'Kontakt', object: 'Smartphone', anchor: [-0.98, 0.95, -1.65] },
  { id: 'ueber-mich', label: 'Über mich', object: 'Regal', anchor: [1.35, 1.25, -0.15] },
]
