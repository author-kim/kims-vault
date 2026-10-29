import catalog from 'virtual:book-catalog'
import type { Book } from '@/types/book'

const loaders = import.meta.glob<string>('../../content/books/*/*.[mM][dD]', {
  query: '?raw',
  import: 'default',
})

export const books: readonly Book[] = catalog

export function findBook(seriesId: string | undefined, id: string | undefined) {
  return books.find((book) => book.seriesId === seriesId && book.id === id)
}

export async function loadBook(book: Book) {
  const loader = loaders[`../../${book.source}`]
  if (!loader) throw new Error(`원고를 찾을 수 없습니다: ${book.id}`)
  return loader()
}
