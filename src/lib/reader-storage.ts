export type ReaderFont = 'system' | 'source-han' | 'kopub' | 'bookk' | 'maruburi' | 'ridi'
export type ReaderFontWeight = 400 | 500 | 700
export type ReaderTheme = 'light' | 'paper' | 'dark' | 'gray' | 'forest'

export interface ReaderSettings {
  font: ReaderFont
  fontWeight: ReaderFontWeight
  fontSize: number
  lineHeight: number
  indent: 0 | 1 | 2
  theme: ReaderTheme
}

export const defaultSettings: ReaderSettings = {
  font: 'kopub', fontWeight: 400, fontSize: 18, lineHeight: 1.9, indent: 1, theme: 'paper',
}

interface ReaderFontDefinition {
  id: ReaderFont
  label: string
  family: string
  face: string | null
  defaultWeight: ReaderFontWeight
  weights: readonly { value: ReaderFontWeight; label: string }[]
}

export const readerFonts: readonly ReaderFontDefinition[] = [
  { id: 'system', label: '디바이스 기본', family: 'system-ui, sans-serif', face: null, defaultWeight: 400, weights: [{ value: 400, label: '보통' }] },
  { id: 'source-han', label: '본고딕', family: '"Source Han Sans KR", sans-serif', face: 'Source Han Sans KR', defaultWeight: 400, weights: [{ value: 400, label: '보통' }, { value: 500, label: '중간' }] },
  { id: 'kopub', label: 'KoPub 바탕', family: '"KoPub Batang", serif', face: 'KoPub Batang', defaultWeight: 400, weights: [{ value: 400, label: '보통' }, { value: 700, label: '굵게' }] },
  { id: 'bookk', label: '부크크 명조', family: '"Bookk Myungjo", serif', face: 'Bookk Myungjo', defaultWeight: 700, weights: [{ value: 400, label: '가늘게' }, { value: 700, label: '굵게' }] },
  { id: 'maruburi', label: '마루부리', family: '"MaruBuri", serif', face: 'MaruBuri', defaultWeight: 400, weights: [{ value: 400, label: '보통' }, { value: 700, label: '굵게' }] },
  { id: 'ridi', label: '리디바탕', family: '"RIDIBatang", serif', face: 'RIDIBatang', defaultWeight: 400, weights: [{ value: 400, label: '보통' }] },
]

export function getReaderFont(id: unknown): ReaderFontDefinition {
  return readerFonts.find((font) => font.id === id)
    ?? readerFonts.find((font) => font.id === defaultSettings.font)!
}

const storageKey = 'kims-vault:settings:v1'

export function normalizeSettings(value: unknown): ReaderSettings {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const font = getReaderFont(data.font)
  return {
    font: font.id,
    fontWeight: font.weights.find((weight) => weight.value === data.fontWeight)?.value ?? font.defaultWeight,
    theme: data.theme === 'light' || data.theme === 'dark' || data.theme === 'gray' || data.theme === 'forest' ? data.theme : 'paper',
    indent: data.indent === 0 || data.indent === 1 || data.indent === 2 ? data.indent : defaultSettings.indent,
    fontSize: typeof data.fontSize === 'number' && Number.isFinite(data.fontSize)
      ? Math.max(16, Math.min(26, Math.round(data.fontSize))) : defaultSettings.fontSize,
    lineHeight: typeof data.lineHeight === 'number' && Number.isFinite(data.lineHeight)
      ? Math.round(Math.max(1.6, Math.min(2.2, data.lineHeight)) * 10) / 10 : defaultSettings.lineHeight,
  }
}

export function readSettings(): ReaderSettings {
  try { return normalizeSettings(JSON.parse(localStorage.getItem(storageKey) ?? 'null')) }
  catch { return { ...defaultSettings } }
}

export function saveSettings(settings: ReaderSettings) {
  try { localStorage.setItem(storageKey, JSON.stringify(settings)) } catch { /* Reading works without storage. */ }
}
