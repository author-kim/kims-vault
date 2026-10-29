import { createContext, useContext } from 'react'
import type { ReaderSettings } from '@/lib/reader-storage'

export interface SettingsContextValue {
  settings: ReaderSettings
  fontStatus: 'ready' | 'loading' | 'error'
  updateSettings: (patch: Partial<ReaderSettings>) => void
  resetSettings: () => void
}

export const ReaderSettingsContext = createContext<SettingsContextValue | null>(null)

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext)
  if (!context) throw new Error('ReaderSettingsProvider is required')
  return context
}
