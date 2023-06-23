import { createContext, useContext } from 'react'

import {type Chapter, type Scene, ViewModes} from './types'
import APIBridge from "./lib/remote";

interface BookContextValue {
  activeChapter: Chapter | undefined
  activeScene: Scene | undefined
  chapters: Chapter[] | undefined
  viewMode: ViewModes
  api: APIBridge
  addChapter(): void
  addScene(chapterId: string): void
  createScene(chapterId: string, sceneTitle: string, order?: number): void
  reorderChapter(from: number, to: number): void
  reorderScene(chapterId: string, from: number, to: number): void
  setActiveChapter(chapter: Chapter): void
  setActiveScene(chapter: Chapter, scene: Scene): void
  updateChapter(chapter: Chapter): void
  updateScene(scene: Scene): void
  setViewMode(mode: ViewModes): void
}

// @ts-ignore
export const BookContext = createContext<BookContextValue>(null)

export const useBookContext = () => useContext(BookContext)
