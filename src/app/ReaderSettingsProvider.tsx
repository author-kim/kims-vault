import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { ReaderSettingsContext } from '@/app/reader-settings-context'
import { defaultSettings, getReaderFont, normalizeSettings, readSettings, saveSettings, type ReaderFont, type ReaderSettings } from '@/lib/reader-storage'
import { captureReadingAnchor, restoreReadingAnchor } from '@/lib/scroll-anchor'

export default function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(readSettings)
  const [fontLoad, setFontLoad] = useState<{ font: ReaderFont; status: 'ready' | 'loading' | 'error' }>({ font: 'system', status: 'ready' })
  const fontStatus = settings.font === 'system' ? 'ready'
    : fontLoad.font === settings.font ? fontLoad.status : 'loading'
  const effectiveFont = fontStatus === 'ready' ? settings.font : 'system'

  useEffect(() => { saveSettings(settings) }, [settings])

  useEffect(() => {
    if (settings.font === 'system') return
    const font = settings.font
    const definition = getReaderFont(font)
    let active = true
    let timer: ReturnType<typeof setTimeout>
    setFontLoad({ font, status: 'loading' })
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Font loading timed out')), 8000)
    })
    const loading = document.fonts ? Promise.all(
      definition.weights.map(({ value }) => document.fonts.load(`${value} 18px "${definition.face}"`)),
    ).then((faces) => {
      if (faces.some((face) => !face.length)) throw new Error('Font unavailable')
    }) : Promise.reject(new Error('Font loading unavailable'))

    Promise.race([loading, timeout]).then(
      () => { if (active) setFontLoad({ font, status: 'ready' }) },
      () => { if (active) setFontLoad({ font, status: 'error' }) },
    ).finally(() => clearTimeout(timer))
    return () => { active = false; clearTimeout(timer) }
  }, [settings.font])

  useLayoutEffect(() => {
    const anchor = captureReadingAnchor()
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.classList.toggle('dark', settings.theme === 'dark' || settings.theme === 'gray' || settings.theme === 'forest')
    root.style.setProperty('--reader-font-family', getReaderFont(effectiveFont).family)
    root.style.setProperty('--reader-font-weight', String(settings.font === 'system' ? 400 : settings.fontWeight))
    root.style.setProperty('--reader-font-size', `${settings.fontSize}px`)
    root.style.setProperty('--reader-line-height', String(settings.lineHeight))
    root.style.setProperty('--reader-indent', `${settings.indent * 0.5}em`)
    restoreReadingAnchor(anchor)
  }, [settings.theme, settings.fontSize, settings.lineHeight, settings.font, settings.fontWeight, settings.indent, effectiveFont])

  const updateSettings = (patch: Partial<ReaderSettings>) => {
    setSettings((current) => normalizeSettings({
      ...current,
      ...(patch.font && patch.font !== current.font ? { fontWeight: getReaderFont(patch.font).defaultWeight } : {}),
      ...patch,
    }))
  }

  return (
    <ReaderSettingsContext.Provider value={{ settings, fontStatus, updateSettings, resetSettings: () => setSettings({ ...defaultSettings }) }}>
      {children}
    </ReaderSettingsContext.Provider>
  )
}
