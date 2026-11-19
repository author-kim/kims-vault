import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { discoverBooks } from '../scripts/book-catalog.ts'

const fixtures: string[] = []

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'kims-vault-catalog-'))
  fixtures.push(root)
  const write = (path: string, value: string) => {
    const target = join(root, path)
    mkdirSync(resolve(target, '..'), { recursive: true })
    writeFileSync(target, value, 'utf8')
  }
  const series = (volumes: { id: string; file: string; title?: string; number?: number }[] = [{ id: 'vol-1', file: 'it_1.md' }]) => {
    write('content/books/it/series.json', JSON.stringify({
      title: '그',
      volumes: volumes.map((volume, index) => ({ title: '권 제목', number: index + 1, ...volume })),
    }))
  }
  return { root, write, series }
}

afterEach(() => {
  for (const root of fixtures.splice(0)) {
    if (!resolve(root).startsWith(resolve(tmpdir()) + sep) || !root.includes('kims-vault-catalog-')) {
      throw new Error('Unexpected fixture path')
    }
    rmSync(root, { recursive: true, force: true })
  }
})

describe('series and volume discovery', () => {
  it('uses JSON order independently of title prefixes', () => {
    const { root, write, series } = fixture()
    series([{ id: 'first', number: 2, title: '왕과 사는 남자', file: 'it_2.md' }, { id: 'second', number: 1, title: '다른 이야기', file: 'it_1.md' }])
    write('content/books/it/it_2.md', '# 1\n본문')
    write('content/books/it/it_1.md', '본문')
    write('public/covers/it/it_2.png', 'image fixture')
    const books = discoverBooks(root)
    expect(books.map(book => book.id)).toEqual(['first', 'second'])
    expect(books[0]).toEqual({
      id: 'first', seriesId: 'it', seriesTitle: '그', number: 2, title: '왕과 사는 남자',
      source: 'content/books/it/it_2.md', cover: 'covers/it/it_2.png',
    })
    expect(books[1].cover).toBeUndefined()
  })

  it('allows an empty library', () => {
    expect(discoverBooks(fixture().root)).toEqual([])
  })

  it('rejects duplicate volume IDs', () => {
    const { root, series } = fixture()
    series([{ id: 'same', file: '첫째.md' }, { id: 'same', file: '둘째.md' }])
    expect(() => discoverBooks(root)).toThrow('중복')
  })

  it('rejects a missing registered manuscript', () => {
    const { root, series } = fixture()
    series()
    expect(() => discoverBooks(root)).toThrow('원고가 없습니다')
  })

  it('rejects paths outside the series folder', () => {
    const { root, series } = fixture()
    series([{ id: 'escape', file: '../다른 원고.md' }])
    expect(() => discoverBooks(root)).toThrow('MD 파일명')
  })
})
