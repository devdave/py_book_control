import { AppShell, Box, createStyles, LoadingOverlay } from '@mantine/core'

import { clone, find } from 'lodash'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { PromptModal } from '@src/widget/input_modal'

import { Body } from '@src/modes/edit/Body'
import { CompositeHeader } from '@src/modes/edit/CompositeHeader'

import {
    type ActiveElement,
    type Book,
    type Chapter,
    type ChapterIndex,
    EditModes,
    type Scene,
    type SceneIndex
} from '@src/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAppContext } from '@src/App.context'
import { useImmer } from 'use-immer'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'
import { LeftPanel } from './LeftPanel'
import { EditorContext, type EditorContextValue } from './Editor.context'

export const Editor: React.FC = () => {
    const { api, activeBook } = useAppContext()

    const [chapters, _setChapters] = useState<ChapterIndex[]>([])

    const [_activeElement, _setActiveElement] = useImmer<ActiveElement>({
        type: undefined,
        detail: undefined,
        subtype: undefined,
        subdetail: undefined
    })

    const activeElement = new ActiveElementHelper(_activeElement, _setActiveElement)

    const [activeChapter, _setActiveChapter] = useState<ChapterIndex | Chapter | undefined>(undefined)
    const [activeScene, _setActiveScene] = useState<SceneIndex | Scene | undefined>(undefined)

    const [editMode, _setEditMode] = useState<EditModes>(EditModes.LIST)
    const queryClient = useQueryClient()

    const setEditMode = (val: EditModes) => {
        _setEditMode(val)
    }

    const {
        isLoading: indexIsloading,
        isSuccess: indexIsSuccess,
        data: index,
        dataUpdatedAt: indexUpdatedAt
    } = useQuery({
        queryKey: ['book', activeBook.id, 'index'],
        queryFn: () => api.fetch_stripped_chapters()
    })

    useEffect(() => {
        if (indexIsloading) {
            return
        }

        if (!indexIsloading && indexIsSuccess) {
            if (activeChapter === undefined) {
                if (index.length > 0) {
                    activeElement.setChapter(index[0])
                    _setActiveChapter(index[0])
                    if (index[0].scenes.length > 0) {
                        activeElement.assignScene(index[0].scenes[0])
                        _setActiveScene(index[0].scenes[0])
                    }
                }
            }
            if (activeScene === undefined && activeChapter && activeChapter.scenes.length > 0) {
                _setActiveScene(activeChapter.scenes[0])
            }
        }
    }, [activeBook, activeScene, activeChapter, index, indexIsloading, indexIsSuccess])

    const changeBookTitle = useMutation<Book, Error, string>({
        mutationFn: (new_title: string) => api.update_book_title(activeBook.id, new_title),
        onSuccess: (response: Book, new_title: string) => {
            queryClient.invalidateQueries({ queryKey: ['book', activeBook.id, 'index'] }).then()
            activeBook.title = new_title
        }
    })

    const createChapter = useMutation({
        mutationFn: (newChapter: object) => api.create_chapter(newChapter),
        onSuccess: (response) => {
            console.log(response)
            queryClient.invalidateQueries({ queryKey: ['book', activeBook.id] })
        }
    })

    const addChapter = useCallback(async () => {
        const chapterTitle: string = await PromptModal('New chapter title')
        if (chapterTitle.trim().length <= 2) {
            alert("Chapter's must have a title longer than 2 characters.")
            return
        }
        createChapter.mutate({ book_id: activeBook.id, title: chapterTitle })
    }, [])

    const _addScene = useMutation({
        mutationFn: (newScene: { [key: string]: string }) => api.create_scene(newScene.chapterId, newScene.title),
        onSuccess: (newSceneAndChapter: [Scene, Chapter], newSceneParts: Partial<Scene>) => {
            console.log('Added a new scene: ', newSceneAndChapter)
            _setActiveScene(newSceneAndChapter[0])
            _setActiveChapter(newSceneAndChapter[1])

            // queryClient.invalidateQueries(['book', activeBook.id, 'chapter'])
            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', newSceneParts.chapterId]).then()
            queryClient.invalidateQueries(['book', activeBook.id, 'index']).then()
        }
    })

    const createScene = useCallback(
        async (chapterId: string, sceneTitle: string, position = -1, content = '') => {
            _addScene.mutate({ chapterId, title: sceneTitle, position, content })
        },
        [index]
    )

    const addScene = useCallback(async (chapterId: string | undefined): Promise<void | Scene> => {
        if (chapterId === undefined) {
            console.log("Tried to add a scene when there isn't an activeChapter")
            await api.alert('There was a problem creating a new scene!')
            return
        }

        console.log('addScene chapter.id=', chapterId)

        const sceneTitle: string = await PromptModal('New scene title')
        if (sceneTitle.trim().length <= 2) {
            alert('A scene must have a title longer than 2 characters.')
        }

        // return createScene(chapterId, sceneTitle)
    }, [])

    const getChapter = async (chapterId: string) => api.fetch_chapter(chapterId)

    const reorderChapter = useCallback(async (from: number, to: number) => {
        await api.reorder_chapter(from, to)
        await queryClient.invalidateQueries({ queryKey: ['book', activeBook.id, 'index'] })
    }, [])

    const reorderScene = useCallback(async (chapterId: string, from: number, to: number) => {
        await api.reorder_scene(chapterId, from, to)
        await queryClient.invalidateQueries(['book', activeBook.id, 'chapter'])
    }, [])

    const setActiveChapter = useCallback(async (chapter: Chapter) => {
        if (activeChapter && activeChapter.id !== chapter.id) {
            if (chapter.scenes.length > 0) {
                setActiveElement((draft) => {
                    draft.subtype = 'scene'
                    draft.subdetail = chapter.scenes[0].id
                })
                _setActiveScene(chapter.scenes[0])
            } else {
                setActiveElement((draft) => {
                    draft.subtype = undefined
                    draft.subdetail = undefined
                })
                _setActiveScene(undefined)
            }
        }

        _setActiveChapter(chapter)
    }, [])

    const setActiveScene = useCallback((chapter: Chapter, scene: Scene) => {
        _setActiveChapter(chapter)
        _setActiveScene(scene)
    }, [])

    const changeChapter = useMutation({
        mutationFn: (alterChapter: Chapter) => api.update_chapter(alterChapter.id, alterChapter),
        mutationKey: ['book', activeBook.id, 'chapter'],
        onSuccess: (chapter) => {
            queryClient.invalidateQueries({ queryKey: ['book', activeBook.id] })
            queryClient.invalidateQueries({ queryKey: ['book', activeBook.id, 'index'] })
            if (chapter) {
                queryClient.invalidateQueries({ queryKey: ['book', activeBook.id, 'chapter', chapter.id] })
            }
        }
    })

    const updateChapter = useCallback(
        async (chapter: Chapter) => {
            changeChapter.mutate(chapter)
        },

        []
    )

    const changeScene = useMutation({
        mutationFn: (alteredScene: Scene) => api.update_scene(alteredScene.id, alteredScene),
        onSuccess: ([scene, chapter]: [Scene, Chapter]) => {
            console.log('changed scene', scene)
            if (activeChapter?.id === chapter.id) {
                console.log('Updated activeChapter')
                _setActiveChapter(chapter)
            }
            if (activeScene?.id === scene.id) {
                console.log('Updated activeScene')
                _setActiveScene(scene)
            }

            queryClient.setQueryData(
                ['book', activeBook.id, 'chapter', chapter.id, 'scene', scene.id],
                (prior: Scene | undefined): Scene => {
                    if (prior === undefined) {
                        return scene
                    }

                    return {
                        ...prior,
                        ...scene
                    }
                }
            )

            queryClient.invalidateQueries(['book', activeBook.id, 'chapter']).then()
            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', chapter.id]).then()
            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', chapter.id, 'scene', scene.id]).then()
            queryClient.invalidateQueries(['book', activeBook.id, 'index']).then()
        }
    })

    const updateScene = useCallback(async (scene: Scene) => {
        changeScene.mutate(scene)
        if (scene.id === activeScene?.id) {
            _setActiveScene((prior) => ({ ...prior, ...scene }))
        }
    }, [])

    const _deleteScene = useMutation({
        mutationFn: ({ chapterId, sceneId }: { chapterId: string; sceneId: string }) =>
            api.delete_scene(chapterId, sceneId),
        onSuccess: async (data, { chapterId, sceneId }, context) => {
            console.log('Deleted scene', data, chapterId, sceneId, context)
            await queryClient.invalidateQueries(['book', activeBook.id, 'chapter', chapterId])
            await queryClient.invalidateQueries(['book', activeBook.id, 'index'])

            _setActiveChapter((prior): Chapter | ChapterIndex | undefined => {
                if (prior === undefined) {
                    console.log('Error: somehow the user deleted a scene without there being an active chapter')
                    Error('Integrity issue: Deleted a scene without an active scene')
                    return
                }
                const updated: ChapterIndex | Chapter = clone(prior)
                updated.scenes = prior.scenes.filter((scene) => scene.id !== sceneId)
                updated.updated_on = new Date(Date.now()).toUTCString()

                // eslint-disable-next-line consistent-return
                return updated
            })
        }
    })

    const deleteScene = useCallback(async (chapterId: string, sceneId: string) => {
        console.log('Deleting scene: ', chapterId, sceneId)
        const chapter: Chapter = await getChapter(chapterId)

        const target: Scene | SceneIndex | undefined | any = find(chapter.scenes, { scene: sceneId })

        // eslint-disable-next-line consistent-return
        const newActiveScene: Scene | SceneIndex | undefined = target
            ? find(chapter.scenes, { order: target.order - 1 })
            : undefined

        _deleteScene.mutate({ chapterId, sceneId })

        if (newActiveScene) {
            _setActiveScene(newActiveScene)
        } else {
            _setActiveScene(undefined)
        }
    }, [])

    const editorContextValue = useMemo<EditorContextValue>(
        () => ({
            index,
            activeBook,
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            createScene,
            chapters,
            editMode,
            api,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene,
            deleteScene,
            setEditMode,
            _setChapters, //TODO cut out the _set*'s
            _setActiveChapter,
            _setActiveScene,
            changeBookTitle,
            activeElement,
            setActiveElement
        }),
        [
            index,
            activeBook.id,
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            chapters,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene,
            deleteScene,
            setEditMode,
            _setChapters,
            _setActiveChapter,
            _setActiveScene
        ]
    )

    if (indexIsloading) {
        return <LoadingOverlay visible />
    }

    const sceneKeys = activeChapter ? activeChapter.scenes.map((scene) => scene.id) : []

    const superKey = sceneKeys.join()

    const leftPanel = (
        <LeftPanel
            index={index}
            key={`${activeChapter?.id} ${activeScene?.id}  ${activeBook.updated_on} ${indexUpdatedAt} ${superKey}`}
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
