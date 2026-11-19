import { Route, Routes } from 'react-router'
import LibraryPage from '@/pages/LibraryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ReaderPage from '@/pages/ReaderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/books/:seriesId/:bookId" element={<ReaderPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
