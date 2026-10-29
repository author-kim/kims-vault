import type { Book } from '@/types/book'

export interface ReadingPosition {
  revision: string
  anchorId: string
  anchorHash: string
  blockProgress: number
  headingId: string | null
  headingProgress: number
  progress: number
  atEnd: boolean
  savedAt: number
}

export function contentFingerprint(text: string) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619)
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function positionKey(book: Book) {
  return `kims-vault:position:v1:${book.seriesId}:${book.id}`
}

export function readReadingPosition(book: Book): ReadingPosition | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(positionKey(book)) ?? 'null')
    if (!value || typeof value !== 'object') return
    const data = value as Record<string, unknown>
    const ratio = (field: string) => typeof data[field] === 'number'
      && Number.isFinite(data[field]) && data[field] >= 0 && data[field] <= 1
    if (typeof data.revision !== 'string' || !/^[0-9a-f]{8}$/.test(data.revision)
      || typeof data.anchorId !== 'string' || data.anchorId.length > 300
      || typeof data.anchorHash !== 'string' || !/^[0-9a-f]{8}$/.test(data.anchorHash)
      || !(data.headingId === null || typeof data.headingId === 'string' && data.headingId.length <= 300)
      || !ratio('blockProgress') || !ratio('headingProgress') || !ratio('progress')
      || typeof data.atEnd !== 'boolean' || typeof data.savedAt !== 'number' || !Number.isFinite(data.savedAt)) return
    return data as unknown as ReadingPosition
  } catch { return undefined }
}

export function saveReadingPosition(book: Book, position: ReadingPosition) {
  try { localStorage.setItem(positionKey(book), JSON.stringify(position)) } catch { /* Storage is optional. */ }
}

export function getReadingProgress(book: Book): number {
  const position = readReadingPosition(book)
  if (!position) return 0
  // Reserve 100% for records that actually reached the end.
  return position.atEnd ? 100 : Math.min(99, Math.round(position.progress * 100))
}

export function findLastReadingBook(books: readonly Book[]): Book | null {
  let latest: Book | null = null
  let latestSavedAt = -Infinity
  for (const book of books) {
    const position = readReadingPosition(book)
    if (!position || position.atEnd || position.progress <= 0) continue
    if (position.savedAt > latestSavedAt) {
      latest = book
      latestSavedAt = position.savedAt
    }
  }
  return latest
}
