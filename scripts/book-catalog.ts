import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import type { Plugin } from 'vite'
import type { Book } from '../src/types/book.ts'
import { validateManuscriptImages } from './validate-manuscript.ts'

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'])

interface SeriesConfig {
  title: string
  volumes: { id: string; number: number; title: string; file: string }[]
}

function readSeries(path: string): SeriesConfig {
  if (!existsSync(path)) throw new Error(`소설 정보 파일을 만들어주세요: ${path}`)
  const value: unknown = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''))
  if (!value || typeof value !== 'object' || !('title' in value)
    || typeof value.title !== 'string' || !value.title.trim()
    || !('volumes' in value) || !Array.isArray(value.volumes)) {
    throw new Error(`소설 제목과 volumes 배열을 지정해주세요: ${path}`)
  }
  const ids = new Set<string>()
  const files = new Set<string>()
  const numbers = new Set<number>()
  for (const volume of value.volumes) {
    if (!volume || typeof volume !== 'object'
      || typeof volume.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(volume.id)
      || typeof volume.title !== 'string' || !volume.title.trim()
      || typeof volume.number !== 'number' || !Number.isSafeInteger(volume.number) || volume.number < 1
      || typeof volume.file !== 'string' || /[/\\]/.test(volume.file)
      || !/\.md$/i.test(volume.file) || !volume.file.slice(0, -3).trim()) {
      throw new Error(`각 권에 고정 id, 양의 정수 number, title과 MD 파일명을 지정해주세요: ${path}`)
    }
    if (ids.has(volume.id) || files.has(volume.file) || numbers.has(volume.number)) {
      throw new Error(`권 ID, 번호 또는 파일이 중복되었습니다: ${path}`)
    }
    ids.add(volume.id)
    files.add(volume.file)
    numbers.add(volume.number)
  }
  return { title: value.title.trim(), volumes: value.volumes }
}

export function discoverBooks(root: string): Book[] {
  const directory = resolve(root, 'content/books')
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
    .flatMap((entry): Book[] => {
      if (!entry.isDirectory()) {
        if (extname(entry.name).toLowerCase() === '.md') {
          throw new Error(`원고를 소설 폴더 안으로 옮겨주세요: content/books/${entry.name}`)
        }
        return []
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(entry.name)) {
        throw new Error(`소설 폴더 ID는 영문·숫자·밑줄·하이픈을 사용해주세요: ${entry.name}`)
      }
      const series = readSeries(resolve(directory, entry.name, 'series.json'))
      const coverDirectory = resolve(root, 'public/covers', entry.name)
      const coverFiles = existsSync(coverDirectory)
        ? readdirSync(coverDirectory, { withFileTypes: true })
        : []

      return series.volumes.map((volume) => {
        const title = volume.title.trim()
        const source = `content/books/${entry.name}/${volume.file}`
        if (!existsSync(resolve(root, source)) || !statSync(resolve(root, source)).isFile()) {
          throw new Error(`등록된 원고가 없습니다: ${source}`)
        }
        const markdown = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(resolve(root, source)))
        if (!markdown.trim()) throw new Error(`본문이 비어 있습니다: ${source}`)
        validateManuscriptImages(root, source, markdown, entry.name)
        const covers = coverFiles.filter((candidate) => candidate.isFile()
          && imageExtensions.has(extname(candidate.name).toLowerCase())
          && candidate.name.slice(0, -extname(candidate.name).length) === volume.file.slice(0, -extname(volume.file).length))
        if (covers.length > 1) throw new Error(`같은 이름의 표지는 하나만 두세요: ${coverDirectory}/${title}`)

        return {
          id: volume.id,
          seriesId: entry.name,
          seriesTitle: series.title,
          number: volume.number,
          title,
          source,
          ...(covers[0] ? { cover: `covers/${entry.name}/${covers[0].name}` } : {}),
        }
      })
    })
}

export function bookCatalogPlugin(): Plugin {
  const publicId = 'virtual:book-catalog'
  const moduleId = `\0${publicId}`
  let root = ''

  return {
    name: 'book-catalog',
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      discoverBooks(root)
    },
    resolveId(id) {
      if (id === publicId) return moduleId
    },
    load(id) {
      if (id === moduleId) return `export default ${JSON.stringify(discoverBooks(root))}`
    },
    configureServer(server) {
      const directories = ['content/books', 'public/covers'].map((directory) =>
        resolve(server.config.root, directory).replaceAll('\\', '/'))
      server.watcher.add(directories)
      const refresh = (file: string) => {
        const path = file.replaceAll('\\', '/')
        if (!directories.some((directory) => path.startsWith(`${directory}/`))) return
        const module = server.moduleGraph.getModuleById(moduleId)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh).on('change', refresh).on('unlink', refresh)
      server.httpServer?.once('close', () => {
        server.watcher.off('add', refresh).off('change', refresh).off('unlink', refresh)
      })
    },
  }
}
