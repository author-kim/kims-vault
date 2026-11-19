import { useEffect, useRef } from 'react'
import type { OutlineEntry } from '@/hooks/useReaderOutline'
import { cn } from '@/lib/utils'

interface Props {
  headings: OutlineEntry[]
  activeId: string
  loading: boolean
  failed: boolean
  onSelect: (id: string) => void
}

export default function TableOfContents({ headings, activeId, loading, failed, onSelect }: Props) {
  const navigation = useRef<HTMLElement>(null)

  useEffect(() => {
    const list = navigation.current
    const active = list?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!list || !active) return
    const offset = active.getBoundingClientRect().top - list.getBoundingClientRect().top
    list.scrollTop += offset - list.clientHeight / 2 + active.offsetHeight / 2
  }, [activeId, headings])

  const entries = [{ id: 'book-start', title: '책의 처음으로' }, ...headings]

  return (
    <nav ref={navigation} aria-label="이 책의 목차" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
      <ol className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              aria-current={activeId === entry.id ? 'location' : undefined}
              onClick={() => onSelect(entry.id)}
              className={cn(
                'block min-h-11 w-full rounded-md px-4 py-3 text-left text-sm leading-relaxed break-words outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                activeId === entry.id ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
              )}
            >
              {entry.title}
            </button>
          </li>
        ))}
      </ol>
      {loading && <p role="status" className="px-4 py-3 text-sm text-muted-foreground">목차를 불러오는 중…</p>}
      {failed && <p className="px-4 py-3 text-sm text-muted-foreground">본문을 불러오지 못했습니다.</p>}
      {!loading && !failed && !headings.length && (
        <p className="px-4 py-3 text-sm text-muted-foreground">이 책에는 장 제목이 없습니다.</p>
      )}
    </nav>
  )
}
