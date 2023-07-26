import { createContext, useContext } from 'react'

import { type Chapter, type ChapterIndex, EditModes, type Scene, type SceneIndex } from '@src/types'
import APIBridge from '@src/lib/remote'
import { useActiveElementReturn } from '@src/lib/use-active-element'
import { SceneStatusBrokerFunctions } from '@src/brokers/SceneStatusBroker'
import { SceneBrokerFunctions } from '@src/brokers/SceneBroker'
import { CharacterBrokerFunctions } from '@src/brokers/CharacterBroker'
import { ChapterBrokerFunctions } from '@src/brokers/ChapterBroker'

export interface EditorContextValue {
    api: APIBridge

    index: Chapter[] | undefined
    activeElement: useActiveElementReturn
    activeChapter: Chapter | ChapterIndex | undefined
    activeScene: Scene | SceneIndex | undefined

    editMode: EditModes
    setEditMode(mode: EditModes): void

    setActiveChapter(chapter: Chapter | ChapterIndex | undefined): void
    setActiveScene(chapter: ChapterIndex | Chapter | undefined, scene: SceneIndex | Scene | undefined): void

    chapterBroker: ChapterBrokerFunctions
    characterBroker: CharacterBrokerFunctions

    sceneBroker: SceneBrokerFunctions
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = (): EditorContextValue => useContext(EditorContext) as EditorContextValue
