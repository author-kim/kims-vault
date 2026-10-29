import { Link } from "react-router";
import { Bookmark } from "lucide-react";
import BookCover from "@/components/books/BookCover";
import { useReadingProgress } from "@/hooks/useLastReadingBook";
import type { Book } from "@/types/book";

export default function BookTile({ book, isLastReading = false }: { book: Book; isLastReading?: boolean }) {
  const progress = useReadingProgress(book);
  return (
    <Link
      to={`/books/${encodeURIComponent(book.seriesId)}/${encodeURIComponent(book.id)}`}
      className="group flex w-full max-w-lg items-center gap-8 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background sm:gap-10 md:w-[calc(50%_-_24px)]"
    >
      <div className="relative w-20 shrink-0 sm:w-24 lg:w-28">
        <BookCover
          book={book}
          className="transition-opacity group-hover:opacity-85 group-focus-visible:opacity-85 motion-reduce:transition-none"
        />
        {isLastReading && (
          <span className="absolute top-0 left-1 -mt-0.5 text-[#a45f56] dark:text-[#c4877d]" title="최근 읽던 책 · 이어 읽기">
            <Bookmark className="block size-6 fill-current" aria-hidden="true" />
            <span className="sr-only">최근 읽던 책 · 이어 읽기</span>
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm leading-relaxed break-words text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground motion-reduce:transition-none">
          {book.seriesTitle}<span aria-hidden="true"> · </span><span className="sr-only"> </span><span className="whitespace-nowrap tabular-nums">{book.number}권</span>
        </p>
        <h3 className="mt-2 text-[17px] leading-relaxed font-medium text-pretty break-words transition-colors group-hover:text-primary group-focus-visible:text-primary motion-reduce:transition-none sm:text-lg">
          {book.title}
        </h3>
        <div className="mt-4 flex max-w-40 items-center gap-3">
          <div role="progressbar" aria-label={`${book.title} 읽기 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary/60" style={{ width: `${progress}%` }} />
          </div>
          <span aria-hidden="true" className="shrink-0 text-xs text-muted-foreground tabular-nums">{progress}%</span>
        </div>
      </div>
    </Link>
  );
}
