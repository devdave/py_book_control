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
    type SceneIndex,
    UID
} from '@src/types'
import APIBridge from '@src/lib/remote'
import { Updater } from 'use-immer'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'

export interface EditorContextValue {
    api: APIBridge

    index: Chapter[]
    activeElement: ActiveElementHelper
    activeChapter: Chapter | ChapterIndex | undefined
    activeScene: Scene | SceneIndex | undefined

    editMode: EditModes
    setEditMode(mode: EditModes): void

    setActiveChapter(chapter: Chapter | ChapterIndex | undefined): void
    setActiveScene(chapter: ChapterIndex | Chapter | undefined, scene: SceneIndex | Scene | undefined): void

    fetchChapter(book_id: UID, chapter_id: UID): UseQueryResult<Chapter, Error>
    addChapter(): void
    updateChapter(chapter: Chapter): void
    reorderChapter(from: number, to: number): void

    fetchScene(chapter_id: UID, scene_id: UID): UseQueryResult<Scene, Error>
    addScene(chapterId: string): Promise<Scene | void>
    createScene(chapterId: string, sceneTitle: string, order?: number, content?: string): Promise<void>
    reorderScene(chapterId: string, from: number, to: number): void
    updateScene(scene: Partial<Scene>): void
    deleteScene(chapterId: string, sceneId: string): void

    changeBookTitle: UseMutationResult<Book, Error, string>

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
