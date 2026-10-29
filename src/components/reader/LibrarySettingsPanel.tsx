import { Settings, X } from 'lucide-react'
import ReadingSettings from '@/components/reader/ReadingSettings'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function LibrarySettingsPanel() {
  return (
    <Sheet>
      <header className="reader-toolbar" aria-label="서재 메뉴">
        <div className="flex h-13 items-center px-2 lg:h-auto lg:p-0">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="읽기 설정 열기" className="size-11 shrink-0 text-muted-foreground hover:text-foreground lg:bg-background/90 lg:backdrop-blur-sm">
              <Settings aria-hidden="true" />
            </Button>
          </SheetTrigger>
        </div>
      </header>
      <SheetContent>
        <header className="flex shrink-0 items-start justify-between gap-3 border-b p-6">
          <div>
            <SheetTitle className="text-base leading-relaxed font-medium">읽기 설정</SheetTitle>
            <SheetDescription className="sr-only">글꼴, 글자 크기, 줄 간격과 화면 테마를 설정합니다. 변경한 설정은 독서 화면에도 적용됩니다.</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="-mt-3 -mr-3 size-11 shrink-0 text-muted-foreground" aria-label="패널 닫기">
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </header>
        <ReadingSettings />
        <footer className="flex shrink-0 justify-end border-t p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <SheetClose asChild>
            <Button variant="ghost" className="min-h-11"><X aria-hidden="true" /> 닫기</Button>
          </SheetClose>
        </footer>
      </SheetContent>
    </Sheet>
  )
}
