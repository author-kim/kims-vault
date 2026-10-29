import { memo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { documentAssetUrl } from '@/lib/assets'
import { remarkCurlyQuotes, remarkReadingIds } from '@/lib/markdown'
import { rehypeReaderLineBreaks } from '@/lib/reader-line-breaks'

// Generate IDs first so existing section links remain stable.
const plugins = [remarkGfm, remarkReadingIds, remarkCurlyQuotes]

function MarkdownDocument({ markdown, seriesId }: { markdown: string; seriesId: string }) {
  return (
    <article className="reader-content">
      <Markdown
        remarkPlugins={plugins}
        rehypePlugins={[rehypeReaderLineBreaks]}
        skipHtml
        components={{
          img: ({ src, alt }) => (
            <img src={src ? documentAssetUrl(src, seriesId) : undefined} alt={alt ?? ''} loading="lazy" />
          ),
          a: ({ href, children }) => (
            <a
              href={href ? documentAssetUrl(href, seriesId) : undefined}
              onClick={(event) => {
                if (!href?.startsWith('#')) return
                event.preventDefault()
                let id: string
                try { id = decodeURIComponent(href.slice(1)) } catch { return }
                const target = document.getElementById(id) ?? document.getElementById(`heading-${id}`)
                if (!target) return
                window.dispatchEvent(new Event('reader-navigation'))
                target.scrollIntoView({ block: 'start' })
                target.tabIndex = -1
                target.focus({ preventScroll: true })
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </article>
  )
}

export default memo(MarkdownDocument)
