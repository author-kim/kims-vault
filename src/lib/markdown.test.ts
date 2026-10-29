import { describe, expect, it } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { toString } from 'mdast-util-to-string'
import type { Root } from 'mdast'
import { remarkCurlyQuotes, remarkReadingIds } from './markdown'

function renderText(markdown: string) {
  const processor = unified().use(remarkParse).use(remarkReadingIds).use(remarkCurlyQuotes)
  return processor.runSync(processor.parse(markdown)) as Root
}

describe('reader quotation marks', () => {
  it('pairs mixed quotes across formatting and preserves nested quote levels', () => {
    expect(toString(renderText('”그는 **안녕**이라고 말했다. \'정말이야?‘“')))
      .toBe('“그는 안녕이라고 말했다. ‘정말이야?’”')
    expect(toString(renderText('"그가 \'안녕’이라고 했어.”')))
      .toBe('“그가 ‘안녕’이라고 했어.”')
  })

  it('resets after blank lines, Enter, and Markdown hard breaks', () => {
    for (const separator of ['\n\n', '\n', '  \n']) {
      const tree = renderText(`"닫는 따옴표 누락${separator}"다음 대사"`)
      expect(toString(tree)).toContain('“다음 대사”')
    }
  })

  it('leaves code, link destinations, apostrophes, and heading IDs intact', () => {
    const tree = renderText('# "제목"\n\n"대사" `"코드"` ["링크"](/"주소") don\'t\n\n```\n"코드 블록"\n```')
    const text = toString(tree)
    expect(text).toContain('“대사” "코드" “링크” don\'t')
    expect(text).toContain('"코드 블록"')
    const paragraph = tree.children[1]
    if (paragraph.type !== 'paragraph') throw new Error('Expected paragraph')
    const link = paragraph.children.find((node) => node.type === 'link')
    expect(link?.url).toBe('/"주소"')
    const heading = tree.children[0]
    expect(heading.data?.hProperties?.id).toBe('heading-제목')
  })
})
