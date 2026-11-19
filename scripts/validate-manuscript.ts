import { existsSync, statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { localDocumentAsset } from '../src/lib/content-assets.ts'

const parser = unified().use(remarkParse).use(remarkGfm)

export function validateManuscriptImages(root: string, source: string, markdown: string, seriesId: string) {
  const tree = parser.parse(markdown)
  const definitions = new Map<string, string>()
  const normalize = (identifier: string) => identifier.replace(/\s+/g, ' ').toLowerCase()
  const publicDirectory = resolve(root, 'public')

  visit(tree, 'definition', (node) => {
    const key = normalize(node.identifier)
    if (!definitions.has(key)) definitions.set(key, node.url)
  })

  visit(tree, (node) => {
    const url = node.type === 'image' ? node.url
      : node.type === 'imageReference' ? definitions.get(normalize(node.identifier))
        : undefined
    if (!url) return

    const location = `${source}:${node.position?.start.line ?? 1}`
    let asset: ReturnType<typeof localDocumentAsset>
    try {
      asset = localDocumentAsset(url, seriesId)
    } catch {
      throw new Error(`이미지 경로를 확인해주세요: ${location} → ${url}`)
    }
    if (!asset) return

    const target = resolve(publicDirectory, asset.path)
    const fromPublic = relative(publicDirectory, target)
    if (fromPublic === '..' || fromPublic.startsWith('..\\') || fromPublic.startsWith('../') || isAbsolute(fromPublic)) {
      throw new Error(`이미지는 public 폴더 안에 있어야 합니다: ${location} → ${url}`)
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      throw new Error(`본문 이미지가 없습니다: ${location} → public/${asset.path}`)
    }
  })
}
