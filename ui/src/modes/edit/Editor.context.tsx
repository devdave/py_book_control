import { createContext, useContext } from 'react'

import { type Book, type Chapter, type ChapterIndex, EditModes, type Scene, type SceneIndex } from '@src/types'
import APIBridge from '@src/lib/remote'
import { UseMutationResult } from '@tanstack/react-query'

export interface EditorContextValue {
    index: Chapter[]
    activeBook: Book
    activeChapter: Chapter | ChapterIndex | undefined
    activeScene: Scene | SceneIndex | undefined
    chapters: Chapter[] | ChapterIndex[] | undefined
    editMode: EditModes
    api: APIBridge
    addChapter(): void
    addScene(chapterId: string): Promise<Scene | void>
    createScene(chapterId: string, sceneTitle: string, order?: number, content?: string): Promise<void>
    reorderChapter(from: number, to: number): void
    reorderScene(chapterId: string, from: number, to: number): void
    setActiveChapter(chapter: Chapter | ChapterIndex | undefined): void
    setActiveScene(chapter: ChapterIndex | Chapter | undefined, scene: SceneIndex | Scene | undefined): void
    updateChapter(chapter: Chapter): void
    updateScene(scene: Partial<Scene>): void
    deleteScene(chapterId: string, sceneId: string): void
    setEditMode(mode: EditModes): void
    _setChapters(chapters: Chapter[]): void
    _setActiveChapter(chapter: Chapter | ChapterIndex | undefined): void
    _setActiveScene(scene: Scene | SceneIndex | undefined): void
    changeBookTitle: UseMutationResult<Book, Error, string, unknown>
}

// @ts-ignore
export const EditorContext = createContext<EditorContextValue>(null)

export const useEditorContext = () => useContext(EditorContext)
