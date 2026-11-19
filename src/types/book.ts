export interface Book {
  id: string
  seriesId: string
  seriesTitle: string
  number: number | string
  title: string
  source: string
  cover?: string
}
