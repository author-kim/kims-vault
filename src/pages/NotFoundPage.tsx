import { Home } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-lg font-medium">페이지를 찾을 수 없습니다.</h1>
      <Button asChild variant="outline">
        <Link to="/">
          <Home aria-hidden="true" />
          홈으로
        </Link>
      </Button>
    </main>
  )
}
