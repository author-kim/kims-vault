import { localDocumentAsset } from '@/lib/content-assets'

export function publicAssetUrl(path: string) {
  const segments = path.replace(/^\/+/, '').split('/').map(encodeURIComponent)
  return `${import.meta.env.BASE_URL}${segments.join('/')}`
}

export function documentAssetUrl(url: string, seriesId: string) {
  const asset = localDocumentAsset(url, seriesId)
  return asset ? `${publicAssetUrl(asset.path)}${asset.search}${asset.hash}` : url
}
