import { Dispatch, SetStateAction, useCallback } from 'react'
import {
    attachSceneStatus2SceneProps,
    type Book,
    type Chapter,
    type ChapterIndex,
    type Scene,
    type SceneIndex,
    type SceneStatus,
    type UniqueId
} from '@src/types'
import { QueryClient, useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query'
import { PromptModal } from '@src/widget/input_modal'
import { clone, find } from 'lodash'
import APIBridge from '@src/lib/remote'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'
import { ChapterBrokerFunctions } from '@src/brokers/ChapterBroker'

export interface SceneBrokerProps {
    api: APIBridge
    activeElement: ActiveElementHelper
    activeBook: Book
    activeChapter: Chapter | ChapterIndex | undefined
    activeScene: Scene | SceneIndex | undefined

    _setActiveChapter: Dispatch<SetStateAction<Chapter | ChapterIndex | undefined>>
    _setActiveScene: Dispatch<SetStateAction<Scene | SceneIndex | undefined>>

    getChapter: ChapterBrokerFunctions['get']
    // getChapter: (id: Chapter['id']) => Promise<Chapter>

    queryClient: QueryClient
}

export interface SceneBrokerFunctions {
    add: (chapterId: string | undefined) => Promise<void | Scene>
    attachSceneStatus2Scene: (book_uid: Book['id'], scene: Scene, status: SceneStatus) => void
    change: UseMutationResult<[Scene, Chapter], unknown, Scene, unknown>
    fetch: (chapter_id: Scene['chapterId'], scene_id: Scene['id']) => UseQueryResult<Scene, Error>
    update: (scene: Scene) => Promise<void>
    create: (
        chapterId: Scene['chapterId'],
        sceneTitle: Scene['title'],
        position: Scene['order'],
        content: Scene['content']
    ) => Promise<void>
    reorder: (chapterId: Scene['chapterId'], from: number, to: number) => Promise<void>
    delete: (chapterId: Scene['chapterId'], sceneId: Scene['id']) => Promise<void>
}

export const SceneBroker = ({
    api,
    activeElement,
    activeBook,
    activeScene,
    activeChapter,
    _setActiveChapter,
    _setActiveScene,
    getChapter,
    queryClient
}: SceneBrokerProps): SceneBrokerFunctions => {
    const fetchScene = useCallback(
        (chapter_id: UniqueId, scene_id: UniqueId) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Scene, Error>({
                queryFn: () => api.fetch_scene(scene_id),
                queryKey: ['book', activeBook.id, 'chapter', chapter_id, 'scene', scene_id]
            }),
        [activeBook.id, api]
    )

    const _addScene = useMutation({
        mutationFn: (newScene: { [key: string]: string | number }) =>
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
    ) => Promise<void> = async (chapterId: string, sceneTitle: string, position = -1, content = '') => {
        _addScene.mutate({
            chapterId,
            title: sceneTitle,
            position,
            content
        })
    }

    const addScene = useCallback(
        async (chapterId: string | undefined): Promise<void | Scene> => {
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
        },
        [_addScene, api]
    )

    const reorderScene = useCallback(
        async (chapterId: string, from: number, to: number) => {
            await api.reorder_scene(chapterId, from, to)
            await queryClient.invalidateQueries(['book', activeBook.id, 'chapter'])
        },
        [activeBook.id, api, queryClient]
    )

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

    const _attachSceneStatus2Scene = useMutation<Scene, Error, attachSceneStatus2SceneProps>({
        mutationKey: ['scene', 'status_update'],
        mutationFn: (changeset: attachSceneStatus2SceneProps) =>
            api.attach_scene_status2scene(changeset.scene_uid, changeset.status_uid),
        onSuccess: (updated_scene: Scene) => {
            queryClient.setQueryData(
                ['book', activeBook.id, 'chapter', updated_scene.chapterId, 'scene', updated_scene.id],
                () => updated_scene
            )

            queryClient
                .invalidateQueries({
                    queryKey: [
                        'book',
                        activeBook.id,
                        'chapter',
                        updated_scene.chapterId,
                        'scene',
                        updated_scene.id
                    ],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })

    const attachSceneStatus2Scene = useCallback((book_uid: Book['id'], scene: Scene, status: SceneStatus) => {
        api.attach_scene_status2scene(scene.id, status.id).then(() => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', book_uid, 'chapter', scene.chapterId, 'scene', scene.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            queryClient.invalidateQueries({
                queryKey: ['book', book_uid, 'sceneStatuses'],
                exact: true,
                refetchType: 'active'
            })
        })
    }, [])

    const updateScene = useCallback(
        async (scene: Scene) => {
            changeScene.mutate(scene)
            if (scene.id === activeScene?.id) {
                activeElement.setSceneById(scene.chapterId, scene.id)
                _setActiveScene((prior) => ({ ...prior, ...scene }))
            }
        },
        [_setActiveScene, activeElement, activeScene?.id, changeScene]
    )

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

    const deleteScene = async (chapterId: string, sceneId: string) => {
        console.log('Deleting scene: ', chapterId, sceneId)
        const chapter: Chapter = await getChapter(chapterId)

        const target: Scene | SceneIndex | undefined = find(chapter.scenes, { id: sceneId })

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
    }

    return {
        delete: deleteScene,
        update: updateScene,
        change: changeScene,
        create: createScene,
        fetch: fetchScene,
        reorder: reorderScene,
        add: addScene,
        attachSceneStatus2Scene
    }
}
