import { createContext, useContext } from 'react'

import {type Chapter, type Scene, SplitResponse, ViewModes} from './types'
import APIBridge from "./lib/remote";

interface BookContextValue {
  activeChapter: Chapter | undefined
  activeScene: Scene | undefined
  chapters: Chapter[] | undefined
  viewMode: string
  api: APIBridge
  addChapter(): void
  addScene(chapterId: string): Promise<Scene|void>
  createScene(chapterId: string, sceneTitle: string, order?: number, content?: string): Promise<Scene>
  reorderChapter(from: number, to: number): void
  reorderScene(chapterId: string, from: number, to: number): void
  setActiveChapter(chapter: Chapter): void
  setActiveScene(chapter: Chapter, scene: Scene): void
  updateChapter(chapter: Chapter): void
  updateScene(scene: Scene): void
  deleteScene(chapterId: string, sceneId: string): void
  setViewMode(mode: string): void
  _setChapters (chapters: Chapter[]):void,
  _setActiveChapter (chapter: Chapter): void,
  _setActiveScene(scene: Scene): void,
}

// @ts-ignore
export const BookContext = createContext<BookContextValue>(null)

export const useBookContext = () => useContext(BookContext)
