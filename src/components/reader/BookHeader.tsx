import BookCover from '@/components/books/BookCover'
import type { Book } from '@/types/book'

export default function BookHeader({ book }: { book: Book }) {
  return (
    <header className="mb-14 text-center sm:mb-18">
      <BookCover book={book} priority className="mx-auto max-w-96" />
      <div className="mx-auto mt-6 max-w-xl sm:mt-8">
        <p className="text-sm leading-relaxed break-words text-muted-foreground">
          {book.seriesTitle}<span aria-hidden="true"> · </span><span className="sr-only"> </span><span className="whitespace-nowrap tabular-nums">{book.number}권</span>
        </p>
        <h1 className="mt-2 text-2xl leading-relaxed font-medium text-balance break-words sm:mt-3 sm:text-[28px]">
          {book.title}
        </h1>
      </div>
    </header>
  )
}
