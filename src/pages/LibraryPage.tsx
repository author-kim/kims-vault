import BookTile from '@/components/books/BookTile'
import LibrarySettingsPanel from '@/components/reader/LibrarySettingsPanel'
import { books } from '@/lib/books'
import { useLastReadingBook } from '@/hooks/useLastReadingBook'

const seriesIds = Array.from(new Set(books.map((book) => book.seriesId)))
const collections = seriesIds.map((id) => ({
  id,
  volumes: books.filter((book) => book.seriesId === id),
}))

export default function LibraryPage() {
  const lastReadingBook = useLastReadingBook(books)
  return (
    <>
    <LibrarySettingsPanel />
    <main className="mx-auto min-h-svh max-w-5xl px-5 pt-[calc(84px_+_env(safe-area-inset-top,0px))] pb-12 sm:px-8 sm:pb-20 lg:py-24">
      <div className="mx-auto max-w-lg md:max-w-none">
      <h1 className="mb-10 text-lg leading-relaxed font-medium sm:mb-12 sm:text-xl" aria-label="김작가의 서재">
        <span aria-hidden="true">김<br />작가의<br />서재</span>
      </h1>
      {books.length ? (
        <div className="space-y-20 sm:space-y-28">
          {collections.map(({ id, volumes }) => (
              <section key={id} aria-labelledby={`series-${id}`}>
                <h2 id={`series-${id}`} className="sr-only">
                  {volumes[0].seriesTitle}
                </h2>
                <div className="flex flex-wrap items-start gap-x-12 gap-y-12 sm:gap-y-16">
                  {volumes.map((book) => <BookTile key={book.id} book={book} isLastReading={book === lastReadingBook} />)}
                </div>
              </section>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">아직 등록된 책이 없습니다.</p>
      )}
      </div>
    </main>
    </>
  )
}
