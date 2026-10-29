import { contentFingerprint, type ReadingPosition } from '@/lib/reading-position'

export function readingLine() {
  const toolbar = document.querySelector('.reader-toolbar')?.getBoundingClientRect().bottom ?? 0
  return Math.max(80, toolbar + 16)
}

export function captureReadingAnchor() {
  const reader = document.getElementById('book-start')
  if (!reader) return undefined
  const blocks = reader.querySelectorAll<HTMLElement>('.reader-content [id]')
  const block = Array.from(blocks).find((element) => element.getBoundingClientRect().bottom > readingLine())
  const target = block && block.getBoundingClientRect().top < window.innerHeight ? block : reader
  return { id: target.id, top: target.getBoundingClientRect().top }
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

export function captureReadingPosition(reader: HTMLElement, revision: string): ReadingPosition {
  const blocks = Array.from(reader.querySelectorAll<HTMLElement>('.reader-content h1[id], .reader-content p[id]'))
  const headings = Array.from(reader.querySelectorAll<HTMLElement>('.reader-content h1[id]'))
  const line = readingLine()
  const block = blocks.find((element) => element.getBoundingClientRect().bottom > line) ?? blocks.at(-1)
  const firstTop = blocks[0]?.getBoundingClientRect().top ?? Infinity
  const inOpening = firstTop > line
  const target = inOpening || !block ? reader : block
  const rect = target.getBoundingClientRect()
  let headingIndex = -1
  for (let index = 0; index < headings.length; index++) {
    if (headings[index].getBoundingClientRect().top > line) break
    headingIndex = index
  }
  const heading = headings[headingIndex]
  const chapterTop = heading?.getBoundingClientRect().top ?? 0
  const chapterBottom = headings[headingIndex + 1]?.getBoundingClientRect().top ?? reader.getBoundingClientRect().bottom
  const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  return {
    revision,
    anchorId: target.id,
    anchorHash: contentFingerprint(target === reader ? '' : target.textContent ?? ''),
    blockProgress: inOpening ? 0 : clamp((line - rect.top) / Math.max(1, rect.height)),
    headingId: heading?.id ?? null,
    headingProgress: heading ? clamp((line - chapterTop) / Math.max(1, chapterBottom - chapterTop)) : 0,
    progress: inOpening ? 0 : clamp(window.scrollY / maximum),
    atEnd: !inOpening && maximum > 1 && window.scrollY >= maximum - 12,
    savedAt: Date.now(),
  }
}

export function restoreReadingPosition(reader: HTMLElement, position: ReadingPosition, revision: string) {
  if (position.anchorId === 'book-start') {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return
  }
  const find = (id: string) => {
    const element = document.getElementById(id)
    return element && reader.contains(element) ? element : null
  }
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const scrollTo = (top: number) => window.scrollTo({ top: Math.max(0, Math.min(maximum, top)), behavior: 'instant' })
  const anchor = find(position.anchorId)
  if (position.atEnd && position.revision === revision) {
    scrollTo(maximum)
  } else if (anchor && position.revision === revision
    && contentFingerprint(anchor.textContent ?? '') === position.anchorHash) {
    const rect = anchor.getBoundingClientRect()
    scrollTo(window.scrollY + rect.top + rect.height * position.blockProgress - readingLine())
  } else {
    const headings = Array.from(reader.querySelectorAll<HTMLElement>('.reader-content h1[id]'))
    const index = headings.findIndex((heading) => heading.id === position.headingId)
    const heading = headings[index]
    if (heading) {
      const start = heading.getBoundingClientRect().top
      const end = headings[index + 1]?.getBoundingClientRect().top ?? reader.getBoundingClientRect().bottom
      scrollTo(window.scrollY + start + (end - start) * position.headingProgress - readingLine())
    } else {
      scrollTo(maximum * position.progress)
    }
  }
}

export function restoreReadingAnchor(anchor: ReturnType<typeof captureReadingAnchor>) {
  if (!anchor) return
  const target = document.getElementById(anchor.id)
  if (!target) return
  const delta = target.getBoundingClientRect().top - anchor.top
  if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' })
}
