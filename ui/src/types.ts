
export interface Base {
  [key:string]: any

  id: string
  created_on: string
  updated_on: string
}

export interface Book extends Base{

  title: string
  notes: string
  chapters: Chapter[]
  words: number
}

export interface Scene extends Base {


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

export interface Chapter extends Base {

  title: string
  summary: string
  notes: string
  scenes: Scene[]
  order: number
  words: number
}

export enum ViewModes {
  LIST= 'list',
  FLOW= 'flow',
  STATS= 'stats',
}


export interface SplitResponse {
  content: string
  split_content: string
  title: string
  split_title: string
}