import { AppShell, Box, LoadingOverlay } from '@mantine/core'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Body } from '@src/modes/edit/Body'
import { CompositeHeader } from '@src/modes/edit/CompositeHeader'

import { AppModes, type Chapter, type ChapterIndex, EditModes, type Scene, type SceneIndex } from '@src/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useAppContext } from '@src/App.context'
import { useActiveElement } from '@src/lib/use-active-element'
import { SceneStatusBroker } from '@src/brokers/SceneStatusBroker'
import { SceneBroker } from '@src/brokers/SceneBroker'
import { CharacterBroker } from '@src/brokers/CharacterBroker'
import { ChapterBroker, ChapterBrokerFunctions } from '@src/brokers/ChapterBroker'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { LeftPanel } from './LeftPanel'
import { EditorContext, type EditorContextValue } from './Editor.context'

export const Editor: React.FC = () => {
    const { api, activeBook, setAppMode } = useAppContext()

    // const [chapters, _setChapters] = useState<ChapterIndex[]>([])

    const activeElement = useActiveElement()

    const [activeChapter, _setActiveChapter] = useState<ChapterIndex | Chapter | undefined>(undefined)
    const [activeScene, _setActiveScene] = useState<SceneIndex | Scene | undefined>(undefined)

    const [editMode, _setEditMode] = useState<EditModes>(EditModes.LIST)
    const queryClient = useQueryClient()

    const setEditMode = (val: EditModes) => {
        _setEditMode(val)
    }

    const {
        isLoading: indexIsLoading,
        isSuccess: indexIsSuccess,
        data: index,
        dataUpdatedAt: indexUpdatedAt
    } = useQuery({
        queryKey: ['book', activeBook.id, 'index'],
        queryFn: () => api.fetch_stripped_chapters(activeBook.id)
    })

    useEffect(() => {
        if (indexIsLoading) {
            return
        }

        if (!indexIsLoading && indexIsSuccess) {
            if (activeChapter === undefined) {
                if (index.length > 0) {
                    if (index[0].scenes.length > 0) {
                        activeElement.setScene(index[0], index[0].scenes[0])
                        activeElement.assignScene(index[0].scenes[0])
                        _setActiveScene(index[0].scenes[0])
                    } else {
                        activeElement.setChapter(index[0])
                        _setActiveChapter(index[0])
                    }
                }
            }
            if (activeScene === undefined && activeChapter && activeChapter.scenes.length > 0) {
                _setActiveScene(activeChapter.scenes[0])
            }
        }
    }, [activeBook, activeScene, activeChapter, index, indexIsLoading, indexIsSuccess, activeElement])

    /**
     *
     * Book stuff
     *   ____              _
     *  |  _ \            | |
     *  | |_) | ___   ___ | | __
     *  |  _ < / _ \ / _ \| |/ /
     *  | |_) | (_) | (_) |   <
     *  |____/ \___/ \___/|_|\_\
     *
     *
     *
     */

    /**
     * Chapter stuff
     *
     *
     *    _____ _                 _
     *   / ____| |               | |
     *  | |    | |__   __ _ _ __ | |_ ___ _ __
     *  | |    | '_ \ / _` | '_ \| __/ _ \ '__|
     *  | |____| | | | (_| | |_) | ||  __/ |
     *   \_____|_| |_|\__,_| .__/ \__\___|_|
     *                     | |
     *                     |_|
     */

    const setActiveChapter = useCallback(
        async (chapter: Chapter) => {
            if (activeChapter && activeChapter.id !== chapter.id) {
                if (chapter.scenes.length > 0) {
                    activeElement.setActiveScene(chapter, chapter.scenes[0])
                    _setActiveScene(chapter.scenes[0])
                } else {
                    activeElement.setChapter(chapter)
                    _setActiveScene(undefined)
                }
            }

            activeElement.assignChapter(chapter)
            _setActiveChapter(chapter)
        },
        [activeChapter, activeElement]
    )

    const chapterBroker: ChapterBrokerFunctions = ChapterBroker({
        api,
        queryClient
    })

    /**
     * Scene stuff
     *
     *
     *    _____
     *   / ____|
     *  | (___   ___ ___ _ __   ___
     *   \___ \ / __/ _ \ '_ \ / _ \
     *   ____) | (_|  __/ | | |  __/
     *  |_____/ \___\___|_| |_|\___|
     *
     *
     */

    const setActiveScene = useCallback(
        (chapter: Chapter, scene: Scene) => {
            activeElement.setActiveScene(chapter, scene)
            _setActiveChapter(chapter)
            _setActiveScene(scene)
        },
        [activeElement]
    )

    const sceneBroker = SceneBroker({
        api,
        activeElement,
        activeScene,
        activeChapter,
        _setActiveScene,
        _setActiveChapter,
        getChapter: chapterBroker.get,
        queryClient
    })

    const characterBroker = CharacterBroker({ api, queryClient, activeBook, activeChapter, setActiveScene })

    /**
     * Packaged everything to do with Scene Status into one portable thing
     */
    const sceneStatusBroker = SceneStatusBroker({ api, queryClient })

    const editorContextValue = useMemo<EditorContextValue>(
        () => ({
            index,
            activeChapter,
            activeScene,

            editMode,
            api,

            setActiveChapter,
            setActiveScene,

            setEditMode,
            activeElement,

            chapterBroker,
            characterBroker,
            sceneStatusBroker,
            sceneBroker
        }),
        [
            index,
            activeChapter,
            activeScene,

            editMode,
            api,
            setActiveChapter,
            setActiveScene,
            activeElement,

            chapterBroker,
            characterBroker,
            sceneStatusBroker,
            sceneBroker
        ]
    )

    if (index === undefined) {
        if (indexIsLoading) {
            return <LoadingOverlay visible />
        }

        ShowError('Error', 'Failed to retrieve the index for the selected book')
        activeElement.clear()
        setAppMode(AppModes.MANIFEST)
    }

    const sceneKeys = activeChapter ? activeChapter.scenes.map((scene) => scene.id) : []

    const superKey = `${activeChapter?.id} ${activeScene?.id}  ${
        activeBook.updated_on
    } ${indexUpdatedAt} ${sceneKeys.join()}`

    const leftPanel = (
        <LeftPanel
            index={index as Chapter[]}
            key={superKey}
        />
    )

    return (
        <EditorContext.Provider value={editorContextValue}>
            <AppShell
                fixed
                navbar={leftPanel}
                header={<CompositeHeader />}
                padding={0}
            >
                <Box
                    px='md'
                    py='sm'
                >
                    <Body />
                </Box>
            </AppShell>
        </EditorContext.Provider>
    )
}
