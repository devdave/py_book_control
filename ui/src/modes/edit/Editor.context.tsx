import { createContext, useContext } from 'react'

import { type Chapter, type ChapterIndex, EditModes, type Scene, type SceneIndex } from '@src/types'
import APIBridge from '@src/lib/remote'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'
import { SceneStatusBrokerFunctions } from '@src/brokers/SceneStatusBroker'
import { SceneBrokerFunctions } from '@src/brokers/SceneBroker'
import { CharacterBrokerFunctions } from '@src/brokers/CharacterBroker'
import { ChapterBrokerFunctions } from '@src/brokers/ChapterBroker'

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

    chapterBroker: ChapterBrokerFunctions
    characterBroker: CharacterBrokerFunctions
    sceneStatusBroker: SceneStatusBrokerFunctions
    sceneBroker: SceneBrokerFunctions
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = (): EditorContextValue => useContext(EditorContext) as EditorContextValue
