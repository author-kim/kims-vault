/** Resolve local manuscript assets relative to public/covers/<seriesId>/. */
export function localDocumentAsset(url: string, seriesId: string) {
  if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return undefined

  const resolved = new URL(url, `https://reader.invalid/covers/${encodeURIComponent(seriesId)}/`)
  return {
    path: decodeURIComponent(resolved.pathname).replace(/^\/+/, ''),
    search: resolved.search,
    hash: resolved.hash,
  }
}
