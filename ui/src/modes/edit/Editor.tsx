import { AppShell, Box, LoadingOverlay } from '@mantine/core'

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
    Character,
    EditModes,
    type Scene,
    type SceneIndex,
    UID
} from '@src/types'
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'

import { useAppContext } from '@src/App.context'
import { useImmer } from 'use-immer'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'
import { string } from 'zod'
import sceneList from '@src/modes/edit/editor_panel/SceneList'
import { LeftPanel } from './LeftPanel'
import { EditorContext, type EditorContextValue } from './Editor.context'

export const Editor: React.FC = () => {
    const { api, activeBook } = useAppContext()

    // const [chapters, _setChapters] = useState<ChapterIndex[]>([])

    const [_activeElement, _setActiveElement] = useImmer<ActiveElement>({
        type: undefined,
        detail: undefined,
        subtype: undefined,
        subdetail: undefined
    })

    const activeElement = useMemo<ActiveElementHelper>(
        () => new ActiveElementHelper(_activeElement, _setActiveElement),
        [_activeElement, _setActiveElement]
    )

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
        queryFn: () => api.fetch_stripped_chapters()
    })

    useEffect(() => {
        if (indexIsLoading) {
            return
        }

        if (!indexIsLoading && indexIsSuccess) {
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
    }, [activeBook, activeScene, activeChapter, index, indexIsLoading, indexIsSuccess])

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

    const changeBookTitle = useMutation<Book, Error, string>({
        mutationFn: (new_title: string) => api.update_book_title(activeBook.id, new_title),
        onSuccess: (response: Book, new_title: string) => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'index']
                })
                .then()
            activeBook.title = new_title
        }
    })

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

    const createChapter = useMutation({
        mutationFn: (newChapter: object) => api.create_chapter(newChapter),
        onSuccess: (response) => {
            console.log(response)
            queryClient.invalidateQueries({ queryKey: ['book', activeBook.id] })
        }
    })

    const addChapter: () => Promise<void> = useCallback(async () => {
        const chapterTitle: string = await PromptModal('New chapter title')
        if (chapterTitle.trim().length <= 2) {
            alert("Chapter's must have a title longer than 2 characters.")
            return
        }
        createChapter.mutate({ book_id: activeBook.id, title: chapterTitle })
    }, [])

    const getChapter: (chapterId: string) => Promise<Chapter> = async (chapterId: string) =>
        api.fetch_chapter(chapterId)

    const fetchChapter = useCallback(
        (book_id: UID, chapter_id: UID) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Chapter, Error>({
                queryFn: () => api.fetch_chapter(chapter_id),
                queryKey: ['book', book_id, 'chapter', chapter_id]
            }),
        [api]
    )

    const reorderChapter = useCallback(async (from: number, to: number) => {
        await api.reorder_chapter(from, to)
        await queryClient.invalidateQueries({
            queryKey: ['book', activeBook.id, 'index']
        })
    }, [])

    const setActiveChapter = useCallback(async (chapter: Chapter) => {
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
    }, [])

    const changeChapter = useMutation<Chapter, Error, Chapter>({
        mutationFn: (alterChapter: Chapter) => api.update_chapter(alterChapter.id, alterChapter),
        mutationKey: ['book', activeBook.id, 'chapter'],
        onSuccess: (chapter) => {
            queryClient.invalidateQueries({
                queryKey: ['book', activeBook.id, 'index']
            })
            if (chapter) {
                queryClient.invalidateQueries({
                    queryKey: ['book', activeBook.id, 'chapter', chapter.id]
                })
            }
        }
    })

    const updateChapter = useCallback<(chapter: Chapter) => Promise<void>>(
        async (chapter: Chapter) => {
            await changeChapter.mutate(chapter)
        },
        [changeChapter]
    )

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

    const fetchScene = useCallback(
        (chapter_id: UID, scene_id: UID) =>
            useQuery<Scene, Error>({
                queryFn: () => api.fetch_scene(scene_id),
                queryKey: ['book', activeBook.id, 'chapter', chapter_id, 'scene', scene_id]
            }),
        []
    )

    const _addScene = useMutation({
        mutationFn: (newScene: { [key: string]: string }) =>
            api.create_scene(newScene.chapterId, newScene.title),
        onSuccess: ([scene, chapter]: [Scene, Chapter], newSceneParts: Partial<Scene>) => {
            console.log('Added a new scene: ', scene, chapter)
            _setActiveScene(scene)
            _setActiveChapter(chapter)

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'chapter', newSceneParts.chapterId],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'index'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })

    const createScene: (
        chapterId: string,
        sceneTitle: string,
        position: number,
        content: string
    ) => Promise<void> = useCallback(
        async (chapterId: string, sceneTitle: string, position = -1, content = '') => {
            _addScene.mutate({
                chapterId,
                title: sceneTitle,
                position,
                content
            })
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

        _addScene.mutate({ chapterId, title: sceneTitle })
    }, [])

    const reorderScene = useCallback(async (chapterId: string, from: number, to: number) => {
        await api.reorder_scene(chapterId, from, to)
        await queryClient.invalidateQueries(['book', activeBook.id, 'chapter'])
    }, [])

    const setActiveScene = useCallback((chapter: Chapter, scene: Scene) => {
        activeElement.setActiveScene(chapter, scene)
        _setActiveChapter(chapter)
        _setActiveScene(scene)
    }, [])

    const changeScene = useMutation({
        mutationFn: (alteredScene: Scene) => api.update_scene(alteredScene.id, alteredScene),
        onSuccess: ([scene, chapter]: [Scene, Chapter]) => {
            console.log('changed scene', scene)
            if (activeChapter?.id === chapter.id) {
                console.log('Updated activeChapter')
                activeElement.setChapter(chapter)
                _setActiveChapter(chapter)
            }
            if (activeScene?.id === scene.id) {
                console.log('Updated activeScene')
                activeElement.setScene(chapter, scene)
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

            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', chapter.id]).then()
            queryClient
                .invalidateQueries(['book', activeBook.id, 'chapter', chapter.id, 'scene', scene.id])
                .then()
            queryClient.invalidateQueries(['book', activeBook.id, 'index']).then()
        }
    })

    const updateScene = useCallback(async (scene: Scene) => {
        changeScene.mutate(scene)
        if (scene.id === activeScene?.id) {
            activeElement.setSceneById(scene.chapterId, scene.id)
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
                    console.log(
                        'Error: somehow the user deleted a scene without there being an active chapter'
                    )
                    throw Error('Integrity issue: Deleted a scene without an active scene')
                }
                const updated: ChapterIndex | Chapter = clone(prior)
                updated.scenes = prior.scenes.filter((scene) => scene.id !== sceneId)
                updated.updated_on = new Date(Date.now()).toUTCString()

                // eslint-disable-next-line consistent-return
                return updated
            })
        }
    })

    const deleteScene = useCallback(
        async (chapterId: string, sceneId: string) => {
            console.log('Deleting scene: ', chapterId, sceneId)
            const chapter: Chapter = await getChapter(chapterId)

            const target: Scene | SceneIndex | undefined | any = find(chapter.scenes, { id: sceneId })

            // eslint-disable-next-line consistent-return
            const newActiveScene: Scene | SceneIndex | undefined = target
                ? find(chapter.scenes, { order: target.order - 1 })
                : undefined

            _deleteScene.mutate({ chapterId, sceneId })

            if (newActiveScene) {
                activeElement.setScene(chapter, newActiveScene as Scene)
                _setActiveScene(newActiveScene)
            } else {
                activeElement.clearSubType()
                _setActiveScene(undefined)
            }
        },
        [getChapter, activeElement, _setActiveScene, _setActiveScene]
    )

    /**
     * Character stuff
     *  _____ _                          _
     * /  __ \ |                        | |
     * | /  \/ |__   __ _ _ __ __ _  ___| |_ ___ _ __
     * | |   | '_ \ / _` | '__/ _` |/ __| __/ _ \ '__|
     * | \__/\ | | | (_| | | | (_| | (__| ||  __/ |
     *  \____/_| |_|\__,_|_|  \__,_|\___|\__\___|_|
     *
     * PyCharm sucks at detecting useCallback consts
     *
     */

    /**
     * Wrap around UseQuery so it can be parameterized
     */
    const fetchCharacter = useCallback(
        (book_id: string, character_id: string, enabled: boolean): UseQueryResult<Character, Error> => {
            const toon_key = ['book', book_id, 'character', character_id]
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useQuery(toon_key, () => api.fetch_character(book_id, character_id), {
                enabled
            })
        },
        [api, useQuery]
    )

    const _updateCharacterQueryCacheData = useCallback(
        (original: Character[], updated: Character): Character[] =>
            original.map((toon) => {
                if (toon.id === updated.id) {
                    return updated
                }
                return toon
            }),
        []
    )

    const _updateCharacter = useMutation<Character, Error, Character>({
        mutationFn: (character: Character) => api.update_character(character),
        onSuccess: (updated_character) => {
            queryClient.setQueryData(
                ['book', activeBook.id, 'character', updated_character.id],
                () => updated_character
            )

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'character', updated_character.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient.setQueryData(['book', activeBook.id, 'characters'], (original) =>
                _updateCharacterQueryCacheData(original as Character[], updated_character)
            )

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const updateCharacter = useCallback(
        (changeset: Character) => {
            _updateCharacter.mutate(changeset)
        },
        [_updateCharacter]
    )

    const deleteCharacter = useCallback(
        (character_id: string) => {
            api.delete_character(character_id)

            queryClient.invalidateQueries({
                queryKey: ['book', activeBook.id, 'characters'],
                exact: true,
                refetchType: 'active'
            })
            queryClient.invalidateQueries({
                queryKey: ['book', activeBook.id, 'character', character_id],
                exact: true,
                refetchType: 'active'
            })
        },
        [queryClient, activeBook]
    )

    const assignCharacter2Scene = useCallback(
        (scene: Scene, char_id: string) => {
            api.add_character_to_scene(scene.id, char_id).then((new_scene) =>
                setActiveScene(activeChapter as Chapter, new_scene as Scene)
            )

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'chapter', scene.chapterId, 'scene', scene.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'scene', scene.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            return char_id
        },
        [activeBook.id, activeChapter, api, queryClient, setActiveScene]
    )

    const createNewCharacterAndAdd2Scene = useCallback(
        (scene: Scene, new_name: string) => {
            api.create_new_character_to_scene(activeBook.id, scene.id, new_name).then((new_scene) => {
                setActiveScene(activeChapter as Chapter, new_scene)
                queryClient.setQueryData(
                    ['book', activeBook.id, 'chapter', scene.chapterId, 'scene', scene.id],
                    new_scene
                )

                queryClient.setQueryData(
                    ['book', activeBook.id, 'scene', scene.id, 'characters'],
                    new_scene.characters
                )

                queryClient
                    .invalidateQueries({
                        queryKey: ['book', activeBook.id, 'scene', scene.id, 'characters'],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
            })
            return undefined
        },
        [activeBook.id, activeChapter, api, queryClient, setActiveScene]
    )

    const listCharactersByScene = useCallback(
        (scene: Scene): UseQueryResult<Character[], Error> =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery({
                queryKey: ['book', activeBook.id, 'scene', scene.id, 'characters'],
                queryFn: () => api.list_characters_by_scene(scene.id)
            }),
        [activeBook.id, api]
    )

    const listAllCharacters = useCallback(
        (book: Book): UseQueryResult<Character[], Error> =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery({
                queryKey: ['book', book.id, 'characters'],
                queryFn: () => api.list_all_characters(book.id)
            }),
        [api]
    )

    const editorContextValue = useMemo<EditorContextValue>(
        () => ({
            index,
            activeChapter,
            activeScene,
            fetchChapter,
            addChapter,
            updateChapter,
            reorderChapter,
            editMode,
            api,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            fetchScene,
            addScene,
            createScene,
            updateScene,
            deleteScene,
            setEditMode,
            changeBookTitle,
            activeElement,
            fetchCharacter,
            updateCharacter,
            deleteCharacter,
            assignCharacter2Scene,
            createNewCharacterAndAdd2Scene,
            listCharactersByScene,
            listAllCharacters
        }),
        [
            index,
            activeChapter,
            activeScene,
            fetchChapter,
            addChapter,
            updateChapter,
            editMode,
            api,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            fetchScene,
            addScene,
            createScene,
            updateScene,
            deleteScene,
            changeBookTitle,
            activeElement,
            fetchCharacter,
            updateCharacter,
            deleteCharacter,
            assignCharacter2Scene,
            createNewCharacterAndAdd2Scene,
            listCharactersByScene,
            listAllCharacters
        ]
    )

    if (indexIsLoading) {
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
