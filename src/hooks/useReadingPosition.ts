import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useSearchParams } from 'react-router'
import { useReaderSettings } from '@/app/reader-settings-context'
import { contentFingerprint, readReadingPosition, saveReadingPosition } from '@/lib/reading-position'
import { captureReadingPosition, restoreReadingPosition } from '@/lib/scroll-anchor'
import type { Book } from '@/types/book'

const navigationKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

export function useReadingPosition(book: Book, markdown: string | undefined, readerRef: RefObject<HTMLElement | null>) {
  const { fontStatus } = useReaderSettings()
  const [search] = useSearchParams()
  const section = search.get('section')
  const revision = useMemo(() => markdown === undefined ? undefined : contentFingerprint(markdown), [markdown])
  const saved = useRef(readReadingPosition(book))
  const restored = useRef(false)
  const interrupted = useRef(false)

  // Register before the manuscript or fonts finish loading, so user input always wins.
  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const interrupt = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[role="dialog"]')) return
      interrupted.current = true
      restored.current = true
    }
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Element
        && (readerRef.current?.contains(event.target) || event.target === document.documentElement)) interrupt(event)
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      if (navigationKeys.has(event.key)) interrupt(event)
    }
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('touchmove', interrupt, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('reader-navigation', interrupt)
    return () => {
      window.history.scrollRestoration = previous
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchmove', interrupt)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('reader-navigation', interrupt)
    }
  }, [readerRef])

  useEffect(() => {
    if (!revision || restored.current || fontStatus === 'loading') return
    const reader = readerRef.current
    if (!reader) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let frame = 0
    let resize: ResizeObserver | undefined
    const explicitTarget = section ? document.getElementById(section) ?? document.getElementById(`heading-${section}`) : null
    const anchorTarget = saved.current ? document.getElementById(
      saved.current.revision === revision ? saved.current.anchorId : saved.current.headingId ?? '',
    ) : null
    const target = explicitTarget ?? anchorTarget
    const images = Array.from(reader.querySelectorAll<HTMLImageElement>('img')).filter((image) =>
      image.closest('header') || !target || Boolean(target.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_PRECEDING))
    // Upstream lazy images need their natural height before restoring a later paragraph.
    images.forEach((image) => { image.loading = 'eager' })
    const cleanups: (() => void)[] = []
    const restore = () => {
      if (cancelled || interrupted.current) return
      if (explicitTarget && reader.contains(explicitTarget)) explicitTarget.scrollIntoView({ block: 'start', behavior: 'instant' })
      else if (saved.current) restoreReadingPosition(reader, saved.current, revision)
    }
    const resources = Promise.all([
      ...images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        const done = () => resolve()
        image.addEventListener('load', done, { once: true })
        image.addEventListener('error', done, { once: true })
        cleanups.push(() => { image.removeEventListener('load', done); image.removeEventListener('error', done) })
      })),
      document.fonts?.ready,
    ])
    const timeout = new Promise<void>((resolve) => { timer = setTimeout(resolve, 8000) })
    Promise.race([resources, timeout]).then(() => {
      clearTimeout(timer)
      cleanups.forEach((cleanup) => cleanup())
      if (cancelled || interrupted.current) return
      frame = window.requestAnimationFrame(() => {
        if (cancelled || interrupted.current) return
        restore()
        restored.current = true
        // Correct late image/font layout changes only until the reader starts interacting.
        if (saved.current || explicitTarget) {
          resize = new ResizeObserver(() => {
            if (interrupted.current) { resize?.disconnect(); return }
            window.cancelAnimationFrame(frame)
            frame = window.requestAnimationFrame(restore)
          })
          resize.observe(reader)
        }
      })
    })
    return () => {
      cancelled = true
      clearTimeout(timer)
      window.cancelAnimationFrame(frame)
      resize?.disconnect()
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [revision, fontStatus, readerRef, section])

  useEffect(() => {
    if (!revision) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const save = () => {
      clearTimeout(timer)
      timer = undefined
      const reader = readerRef.current
      if (!restored.current || !reader?.querySelector('.reader-content')) return
      saveReadingPosition(book, captureReadingPosition(reader, revision))
    }
    const schedule = () => {
      if (restored.current && timer === undefined) timer = setTimeout(save, 1000)
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') save() }
    // Capture before a home link unmounts the reader.
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest('a[href]')) save()
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('pagehide', save)
    window.addEventListener('popstate', save)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('click', onClick, true)
    return () => {
      save()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('pagehide', save)
      window.removeEventListener('popstate', save)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('click', onClick, true)
    }
  }, [book, revision, readerRef])
}
