import { useEffect, useRef, useState } from 'react'
import { Home } from 'lucide-react'
import { Link, useParams } from 'react-router'
import BookHeader from '@/components/reader/BookHeader'
import ReaderPanel from '@/components/reader/ReaderPanel'
import MarkdownDocument from '@/components/reader/MarkdownDocument'
import { Button } from '@/components/ui/button'
import { findBook, loadBook } from '@/lib/books'
import { useReadingPosition } from '@/hooks/useReadingPosition'
import NotFoundPage from '@/pages/NotFoundPage'
import type { Book } from '@/types/book'
import '@/styles/reader.css'

function ReaderContent({ book }: { book: Book }) {
  const readerRef = useRef<HTMLElement>(null)
  const [content, setContent] = useState<{ markdown?: string; failed?: boolean }>({})
  useReadingPosition(book, content.markdown, readerRef)

  useEffect(() => {
    let active = true
    window.scrollTo(0, 0)
    loadBook(book).then(
      (markdown) => { if (active) setContent({ markdown }) },
      () => { if (active) setContent({ failed: true }) },
    )
    return () => { active = false }
  }, [book])

  return (
    <>
    <ReaderPanel book={book} readerRef={readerRef} markdown={content.markdown} failed={content.failed ?? false} />
    <main ref={readerRef} id="book-start" className="reader-page mx-auto min-h-svh max-w-3xl px-5 pb-[calc(128px_+_env(safe-area-inset-bottom,0px))] min-[400px]:px-6">
      <BookHeader book={book} />
      {content.failed ? (
        <p role="alert" className="text-center text-muted-foreground">본문을 불러오지 못했습니다. 새로고침해서 다시 시도해 주세요.</p>
      ) : content.markdown !== undefined ? (
        <MarkdownDocument markdown={content.markdown} seriesId={book.seriesId} />
      ) : (
        <p role="status" className="text-center text-muted-foreground">불러오는 중…</p>
      )}
      <footer className="flex justify-center pt-28 sm:pt-40">
        <Button asChild variant="ghost" size="icon" className="size-11 text-muted-foreground hover:text-foreground">
          <Link to="/" aria-label="홈으로">
            <Home className="size-5" aria-hidden="true" />
          </Link>
        </Button>
      </footer>
    </main>
    </>
  )
}

export default function ReaderPage() {
  const { seriesId, bookId } = useParams()
  const book = findBook(seriesId, bookId)
  return book ? <ReaderContent key={`${book.seriesId}/${book.id}`} book={book} /> : <NotFoundPage />
}
