
export interface Book {
  id: string
  title: string
  notes: string
  chapters: Chapter[]
  words: number
}

export interface Scene {
  [key:string]: string|number
  id: string
  chapterId: string
  title: string
  summary: string
  content: string
  notes: string
  location: string
  characters: string

  order: number
  words: number

}

export interface Chapter {
  id: string
  title: string
  summary: string
  notes: string
  scenes: Scene[]
  order: number
  words: number
}
