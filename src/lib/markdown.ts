import GithubSlugger from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

export function remarkCurlyQuotes() {
  return (tree: Root) => {
    visit(tree, (block) => {
      if (block.type !== 'paragraph' && block.type !== 'heading' && block.type !== 'tableCell') return
      let doubleOpen = false
      let singleOpen = false
      const reset = () => { doubleOpen = false; singleOpen = false }

      // Keep state across emphasis and link labels, but never alter code or URLs.
      visit(block, (node) => {
        if (node.type === 'break') { reset(); return }
        if (node.type !== 'text') return
        node.value = node.value.replace(/["“”'‘’\r\n]/g, (character, offset: number, text: string) => {
          // Manuscript Enter breaks count as new paragraphs in this reader.
          if (character === '\r' || character === '\n') { reset(); return character }
          if (character === '"' || character === '“' || character === '”') {
            doubleOpen = !doubleOpen
            return doubleOpen ? '“' : '”'
          }
          // Preserve English apostrophes such as don't and it's.
          if (/[a-z]/i.test(text[offset - 1] ?? '') && /[a-z]/i.test(text[offset + 1] ?? '')) return character
          singleOpen = !singleOpen
          return singleOpen ? '‘' : '’'
        })
      })
    })
  }
}

export function remarkReadingIds() {
  return (tree: Root) => {
    const slugger = new GithubSlugger()
    let paragraph = 0

    visit(tree, (node) => {
      if (node.type !== 'heading' && node.type !== 'paragraph') return
      const id = node.type === 'heading'
        ? `heading-${slugger.slug(toString(node))}`
        : `paragraph-${++paragraph}`
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
    })
  }
}
