/// <reference types="vite/client" />

declare module 'virtual:book-catalog' {
  const books: import('./types/book').Book[]
  export default books
}
