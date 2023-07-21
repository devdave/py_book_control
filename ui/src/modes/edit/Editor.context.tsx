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
    SceneStatus,
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

    fetchChapter(book_id: Book['id'], chapter_id: Chapter['id']): UseQueryResult<Chapter, Error>
    addChapter(): void
    updateChapter(chapter: Chapter): void
    reorderChapter(from: number, to: number): void

    fetchScene(chapter_id: Scene['chapterId'], scene_id: Scene['id']): UseQueryResult<Scene, Error>
    addScene(chapterId: Scene['chapterId']): Promise<Scene | void>
    createScene(
        chapterId: Scene['chapterId'],
        sceneTitle: Scene['title'],
        order?: Scene['order'],
        content?: Scene['content']
    ): Promise<void>
    reorderScene(chapterId: Scene['chapterId'], from: number, to: number): void
    updateScene(scene: Partial<Scene>): void
    deleteScene(chapterId: Scene['chapterId'], sceneId: Scene['id']): void

    changeBookTitle: UseMutationResult<Book, Error, string>

    fetchCharacter(
        book_id: Book['id'],
        character_id: Character['id'],
        enabled: boolean
    ): UseQueryResult<Character, Error>
    updateCharacter(changeset: Character): void
    deleteCharacter(character_id: Character['id']): void
    assignCharacter2Scene(scene: Scene, character_id: Character['id']): void
    createNewCharacterAndAdd2Scene(scene: Scene, character_name: Character['name']): string | undefined
    listCharactersByScene(scene: Scene): UseQueryResult<Character[], Error>
    listAllCharacters(book: Book): UseQueryResult<Character[], Error>

    fetchAllSceneStatuses(book_id: Book['id']): UseQueryResult<SceneStatus[], Error>
    attachSceneStatus2Scene(book_uid: Book['id'], scene: Scene, status: SceneStatus): void
    fetchSceneStatus(book_uid: Book['id'], status_uid: SceneStatus['id']): UseQueryResult<SceneStatus, Error>
    createSceneStatus(name: SceneStatus['name'], book: Book, scene?: Scene): void
    updateSceneStatus(book_uid: Book['id'], status_uid: SceneStatus['id'], changeset: SceneStatus): void
    deleteSceneStatus(book_uid: Book['id'], status_id: SceneStatus['id']): void
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = (): EditorContextValue => useContext(EditorContext) as EditorContextValue
