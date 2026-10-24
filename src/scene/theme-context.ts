import { createContext, useContext } from 'react'

export type Mode = 'nacht' | 'tag'

export const ThemeContext = createContext<Mode>('nacht')

export function useMode() {
  return useContext(ThemeContext)
}
