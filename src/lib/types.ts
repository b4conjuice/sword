export type Note = {
  id?: number
  text: string
  title: string
  body: string
  list: string[]
  tags: string[]
}

export type HistoryEntry = {
  scripture: Scripture
  date: Date
  url: string
}

export type Scripture = {
  text?: string
  bookName: string // TODO: rename to book for simplicity, but maybe not to distiuguish from bookNumber
  bookNumber: number
  chapter: number
  verse?: number
  asString?: string
}
