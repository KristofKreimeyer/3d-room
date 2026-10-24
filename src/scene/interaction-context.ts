import { createContext, useContext } from 'react'
import type { SectionId } from '../content'

export type Interaction = {
  hovered: SectionId | null
  setHovered: (id: SectionId | null) => void
  pick: (id: SectionId) => void
}

export const InteractionContext = createContext<Interaction | null>(null)

export function useInteraction() {
  const ctx = useContext(InteractionContext)
  if (!ctx) throw new Error('useInteraction braucht einen InteractionContext.Provider')
  return ctx
}
