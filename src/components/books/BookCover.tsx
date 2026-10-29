import { useState } from 'react'
import { publicAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/utils'
import type { Book } from '@/types/book'

export default function BookCover({ book, className, priority = false }: {
  book: Book
  className?: string
  priority?: boolean
}) {
  const [failedSource, setFailedSource] = useState<string>()

  if (!book.cover || failedSource === book.cover) {
    return (
      <div aria-hidden="true" className={cn('flex min-h-48 w-full items-center justify-center bg-muted p-6 text-center leading-relaxed break-words text-muted-foreground', className)}>
        {book.title}
      </div>
    )
  }

  return (
    <img
      src={publicAssetUrl(book.cover)}
      alt=""
      className={cn('block h-auto w-full', className)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailedSource(book.cover)}
    />
  )
}
