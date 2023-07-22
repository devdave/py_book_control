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
import { SceneStatusBrokerFunctions, SceneStatusBrokerType } from '@src/brokers/SceneStatusBroker'
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
