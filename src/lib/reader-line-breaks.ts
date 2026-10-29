import type { Element, ElementContent, Root } from 'hast'
import { visit } from 'unist-util-visit'

// Preserve manuscript line breaks, including those inside emphasis and links.
// Empty spacers keep indentation out of copied text and saved reading anchors.
export function rehypeReaderLineBreaks() {
  return (tree: Root) => {
    const indent = (): Element => ({
      type: 'element', tagName: 'span',
      properties: { className: ['reader-line-indent'], ariaHidden: 'true' }, children: [],
    })
    const transform = (element: Element) => {
      if (element.tagName === 'code') return
      element.children = element.children.flatMap((child, childIndex): ElementContent[] => {
        const previous = element.children[childIndex - 1]
        // Markdown hard breaks already include a br followed by a newline.
        if (child.type === 'text' && previous?.type === 'element' && previous.tagName === 'br') {
          child.value = child.value.replace(/^\r?\n/, '')
        }
        if (child.type === 'text' && /\r?\n/.test(child.value)) {
          return child.value.split(/\r?\n/).flatMap((line, index): ElementContent[] => [
            ...(index ? [
              { type: 'element' as const, tagName: 'br', properties: {}, children: [] },
              indent(),
            ] : []),
            { type: 'text', value: line },
          ])
        }
        if (child.type === 'element') {
          if (child.tagName === 'br') return [child, indent()]
          transform(child)
        }
        return [child]
      })
    }
    visit(tree, 'element', (node) => {
      if (node.tagName === 'p') transform(node)
    })
  }
}
