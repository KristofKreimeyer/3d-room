import { useEffect, useRef, type ComponentType } from 'react'
import type { SectionId } from '../content'
import { AboutSection, ContactSection, ProjectsSection, SkillsSection } from './Sections'

const SECTION_COMPONENTS: Record<SectionId, ComponentType> = {
  projekte: ProjectsSection,
  skills: SkillsSection,
  'ueber-mich': AboutSection,
  kontakt: ContactSection,
}

type Props = {
  id: SectionId
  onClose: () => void
}

// Info-Panel im 3D-Raum: zeigt den Inhalt des angeklickten Objekts.
// Der Fokus springt beim Öffnen ins Panel, Escape und der Schließen-Button bringen ihn zurück.
export function InfoPanel({ id, onClose }: Props) {
  const ref = useRef<HTMLElement>(null)
  const Section = SECTION_COMPONENTS[id]

  useEffect(() => {
    ref.current?.focus()
  }, [id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <aside ref={ref} className="panel" role="dialog" aria-labelledby={`${id}-h`} tabIndex={-1}>
      <button type="button" className="panel__close" onClick={onClose} aria-label="Schließen">
        ×
      </button>
      <Section />
    </aside>
  )
}
