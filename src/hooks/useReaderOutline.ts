import { useEffect, useState, type RefObject } from 'react'

export interface OutlineEntry {
  id: string
  title: string
}

export function useReaderOutline(readerRef: RefObject<HTMLElement | null>, markdown: string | undefined) {
  const [headings, setHeadings] = useState<OutlineEntry[]>([])
  const [activeId, setActiveId] = useState('book-start')

  useEffect(() => {
    const reader = readerRef.current
    if (!reader) return
    const elements = Array.from(reader.querySelectorAll<HTMLElement>('.reader-content h1[id]'))
    setHeadings(elements.map((element) => ({
      id: element.id,
      title: element.textContent?.trim() || '제목 없음',
    })))

    let frame = 0
    const update = () => {
      frame = 0
      const toolbarBottom = document.querySelector('.reader-toolbar')?.getBoundingClientRect().bottom ?? 0
      const readingTop = Math.max(96, toolbarBottom + 16)
      let current = 'book-start'
      for (const element of elements) {
        if (element.getBoundingClientRect().top > readingTop) break
        current = element.id
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
        current = elements.at(-1)?.id ?? current
      }
      setActiveId(current)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(reader)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()

    return () => {
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [readerRef, markdown])

  return { headings, activeId }
}
