import { useEffect, useRef, useState, type RefObject } from 'react'
import { ArrowLeft, Home, List, Settings, X } from 'lucide-react'
import { Link } from 'react-router'
import BookCover from '@/components/books/BookCover'
import TableOfContents from '@/components/reader/TableOfContents'
import ReadingSettings from '@/components/reader/ReadingSettings'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useReaderOutline } from '@/hooks/useReaderOutline'
import type { Book } from '@/types/book'

interface Props {
  book: Book
  readerRef: RefObject<HTMLElement | null>
  markdown: string | undefined
  failed: boolean
}

export default function ReaderPanel({ book, readerRef, markdown, failed }: Props) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'contents' | 'settings'>('contents')
  const destination = useRef<string | null>(null)
  const frame = useRef(0)
  const { headings, activeId } = useReaderOutline(readerRef, markdown)

  useEffect(() => () => window.cancelAnimationFrame(frame.current), [])

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      if (nextOpen) setView('contents')
      setOpen(nextOpen)
    }}>
      <header className="reader-toolbar" aria-label="독서 메뉴">
        <div className="flex h-13 items-center px-2 lg:h-auto lg:p-0">
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="목차 열기"
              className="size-11 shrink-0 text-muted-foreground hover:text-foreground lg:bg-background/90 lg:backdrop-blur-sm"
            >
              <List aria-hidden="true" />
            </Button>
          </SheetTrigger>
        </div>
      </header>
      <SheetContent
        onOpenAutoFocus={(event) => {
          const active = document.querySelector<HTMLElement>('[data-slot="sheet-content"] [aria-current="location"]')
          if (!active) return
          event.preventDefault()
          active.focus({ preventScroll: true })
        }}
        onCloseAutoFocus={(event) => {
          const id = destination.current
          if (!id) return
          event.preventDefault()
          destination.current = null
          // Let the modal restore body scrolling before moving the document.
          frame.current = window.requestAnimationFrame(() => {
            frame.current = window.requestAnimationFrame(() => {
              const target = document.getElementById(id)
              if (!target) return
              target.scrollIntoView({
                block: 'start',
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
              })
              target.tabIndex = -1
              target.focus({ preventScroll: true })
            })
          })
        }}
      >
        <header className="shrink-0 border-b p-6">
          <div className="flex items-start gap-3">
            <BookCover book={book} className="w-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs leading-relaxed break-words text-muted-foreground">{book.seriesTitle} · {book.number}권</p>
              <SheetTitle className="text-base leading-relaxed font-medium break-words">{book.title}</SheetTitle>
              <SheetDescription className="mt-2 text-xs text-muted-foreground">{view === 'settings' ? '읽기 설정' : '목차'}</SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="-mt-3 -mr-3 size-11 shrink-0 text-muted-foreground" aria-label="패널 닫기">
                <X aria-hidden="true" />
              </Button>
            </SheetClose>
          </div>
        </header>
        {view === 'settings' ? <ReadingSettings /> : <TableOfContents
          headings={headings}
          activeId={activeId}
          loading={markdown === undefined && !failed}
          failed={failed}
          onSelect={(id) => {
            window.dispatchEvent(new Event('reader-navigation'))
            destination.current = id
            setOpen(false)
          }}
        />}
        <footer className="flex shrink-0 items-center justify-between gap-2 border-t p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <Button asChild variant="ghost" className="min-h-11">
            <Link to="/" onClick={() => setOpen(false)}>
              <Home aria-hidden="true" />
              홈으로
            </Link>
          </Button>
          <Button variant="ghost" className="min-h-11" onClick={() => setView((current) => current === 'contents' ? 'settings' : 'contents')}>
            {view === 'contents' ? <Settings aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            {view === 'contents' ? '읽기 설정' : '목차로 돌아가기'}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  )
}
