import { createContext, useContext } from 'react'
import { UseQueryResult, UseMutationResult } from '@tanstack/react-query'

import {
    ActiveElement,
    type Book,
    type Chapter,
    type ChapterIndex,
    Character,
    EditModes,
    type Scene,
    type SceneIndex
} from '@src/types'
import APIBridge from '@src/lib/remote'
import { Updater } from 'use-immer'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'

export interface EditorContextValue {
    index: Chapter[]
    activeChapter: Chapter | ChapterIndex | undefined
    activeScene: Scene | SceneIndex | undefined
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
    changeBookTitle: UseMutationResult<Book, Error, string>
    activeElement: ActiveElementHelper

    fetchCharacter(book_id: string, character_id: string, enabled: boolean): UseQueryResult<Character, Error>
    updateCharacter(changeset: Character): void
    deleteCharacter(character_id: string): void
    assignCharacter2Scene(scene: Scene, character_id: string): void
    createNewCharacterAndAdd2Scene(scene: Scene, character_name: string): string | undefined
    listCharactersByScene(scene: Scene): UseQueryResult<Character[], Error>
    listAllCharacters(book: Book): UseQueryResult<Character[], Error>
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = (): EditorContextValue => useContext(EditorContext) as EditorContextValue
