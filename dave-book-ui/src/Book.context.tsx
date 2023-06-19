import { createContext, useContext } from 'react'

import { type Chapter, type Scene } from './types'

interface BookContextValue {
  activeChapter: Chapter | undefined
  activeScene: Scene | undefined
  chapters: Chapter[] | undefined
  addChapter(): void
  addScene(chapterId: string): void
  reorderChapter(from: number, to: number): void
  reorderScene(chapterId: string, from: number, to: number): void
  setActiveChapter(chapter: Chapter): void
  setActiveScene(chapter: Chapter, scene: Scene): void
  updateChapter(chapter: Chapter): void
  updateScene(scene: Scene): void
}

// @ts-ignore
export const BookContext = createContext<BookContextValue>(null)

export const useBookContext = () => useContext(BookContext)
