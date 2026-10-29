import { useSyncExternalStore } from 'react'
import { findLastReadingBook, getReadingProgress } from '@/lib/reading-position'
import type { Book } from '@/types/book'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener('focus', onChange)
  window.addEventListener('pageshow', onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener('focus', onChange)
    window.removeEventListener('pageshow', onChange)
  }
}

export function useLastReadingBook(books: readonly Book[]) {
  // Return catalog objects so unchanged snapshots retain the same identity.
  return useSyncExternalStore(subscribe, () => findLastReadingBook(books), () => null)
}

export function useReadingProgress(book: Book) {
  return useSyncExternalStore(subscribe, () => getReadingProgress(book), () => 0)
}
