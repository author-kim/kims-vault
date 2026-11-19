import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { remarkReadingIds } from '../src/lib/markdown.ts'

function render(markdown: string) {
  return renderToStaticMarkup(createElement(Markdown, {
    remarkPlugins: [remarkGfm, remarkReadingIds],
    skipHtml: true,
  }, markdown))
}

describe('reading document IDs', () => {
  it('keeps repeated Korean headings distinct, including inline formatting', () => {
    const html = render('# 같은 **제목**\n\n본문\n\n# 같은 제목')
    expect(html).toContain('id="heading-같은-제목"')
    expect(html).toContain('id="heading-같은-제목-1"')
    expect(html).toContain('id="paragraph-1"')
  })

  it('ignores code-block hashes and handles documents without headings', () => {
    const html = render('```md\n# 가짜 제목\n```\n\n문단만 있습니다.')
    expect(html).not.toContain('<h1')
    expect(html).toContain('id="paragraph-1"')
  })

  it('restarts IDs per document', () => {
    expect(render('# 1')).toBe(render('# 1'))
    expect(render('# 1')).toContain('id="heading-1"')
  })

  it('omits raw HTML and rejects executable links', () => {
    const html = render('<script>alert(1)</script>\n\n[링크](javascript:alert%281%29)')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('javascript:')
  })
})
