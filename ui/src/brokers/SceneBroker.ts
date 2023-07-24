import { Dispatch, SetStateAction, useCallback } from 'react'
import {
    attachSceneStatus2SceneProps,
    type Book,
    type Chapter,
    type ChapterIndex,
    type Scene,
    type SceneIndex,
    type SceneStatus
} from '@src/types'
import { QueryClient, useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query'
import { clone, find } from 'lodash'
import APIBridge from '@src/lib/remote'
import { ActiveElementHelper } from '@src/lib/ActiveElementHelper'
import { ChapterBrokerFunctions } from '@src/brokers/ChapterBroker'

export interface SceneBrokerProps {
    api: APIBridge
    activeElement: ActiveElementHelper
    activeChapter: Chapter | ChapterIndex | undefined
    activeScene: Scene | SceneIndex | undefined

    _setActiveChapter: Dispatch<SetStateAction<Chapter | ChapterIndex | undefined>>
    _setActiveScene: Dispatch<SetStateAction<Scene | SceneIndex | undefined>>

    getChapter: ChapterBrokerFunctions['get']
    // getChapter: (id: Chapter['id']) => Promise<Chapter>

    queryClient: QueryClient
}

export interface SceneBrokerFunctions {
    // add: (chapterId: string | undefined) => Promise<void | Scene>
    attachSceneStatus2Scene: (book_uid: Book['id'], scene: Scene, status: SceneStatus) => void
    change: UseMutationResult<[Scene, Chapter], unknown, Scene>
    fetch: (
        book_id: Book['id'],
        chapter_id: Scene['chapterId'],
        scene_id: Scene['id']
    ) => UseQueryResult<Scene, Error>
    update: (scene: Scene) => Promise<void>
    create: (
        chapterId: Scene['chapterId'],
        sceneTitle: Scene['title'],
        position: Scene['order'],
        content: Scene['content']
    ) => Promise<void>
    reorder: (chapter: Chapter, from: number, to: number) => Promise<void>
    delete: (bookId: Book['id'], chapterId: Scene['chapterId'], sceneId: Scene['id']) => Promise<void>
}

export const SceneBroker = ({
    api,
    activeElement,
    activeScene,
    activeChapter,
    _setActiveChapter,
    _setActiveScene,
    getChapter,
    queryClient
}: SceneBrokerProps): SceneBrokerFunctions => {
    const fetchScene = useCallback(
        (book_id: Book['id'], chapter_id: Chapter['id'], scene_id: Scene['id']) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Scene, Error>({
                queryFn: () => api.fetch_scene(scene_id),
                queryKey: ['book', book_id, 'chapter', chapter_id, 'scene', scene_id]
            }),
        [api]
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
                    queryKey: ['book', chapter.book_id, 'chapter', newSceneParts.chapterId],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'index'],
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

    // const addScene = useCallback(
    //     async (chapterId: string | undefined): Promise<void | Scene> => {
    //         if (chapterId === undefined) {
    //             console.log("Tried to add a scene when there isn't an activeChapter")
    //             await api.alert('There was a problem creating a new scene!')
    //             return undefined
    //         }
    //         console.log('addScene chapter.id=', chapterId)
    //
    //         const sceneTitle: string = await PromptModal('New scene title')
    //         if (sceneTitle.trim().length <= 2) {
    //             alert('A scene must have a title longer than 2 characters.')
    //         }
    //
    //         return _addScene.mutate({ chapterId, title: sceneTitle })
    //     },
    //     [_addScene, api]
    // )

    const reorderScene = useCallback(
        async (chapter: Chapter, from: number, to: number) => {
            await api.reorder_scene(chapter.id, from, to)
            await queryClient.invalidateQueries(['book', chapter.book_id, 'chapter'])
        },
        [api, queryClient]
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
                ['book', chapter.book_id, 'chapter', chapter.id, 'scene', scene.id],
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

            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'chapter', chapter.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'chapter', chapter.id, 'scene', scene.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'index'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })

    const _attachSceneStatus2Scene = useMutation<Scene, Error, attachSceneStatus2SceneProps>({
        mutationKey: ['scene', 'status_update'],
        mutationFn: (changeset: attachSceneStatus2SceneProps) =>
            api.attach_scene_status2scene(changeset.scene_uid, changeset.status_uid),
        onSuccess: (updated_scene: Scene, changeset) => {
            queryClient.setQueryData(
                ['book', changeset.book_id, 'chapter', updated_scene.chapterId, 'scene', updated_scene.id],
                () => updated_scene
            )

            queryClient
                .invalidateQueries({
                    queryKey: [
                        'book',
                        changeset.book_id,
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
                    queryKey: ['book', changeset.book_id, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })

    const attachSceneStatus2Scene = useCallback(
        (book_uid: Book['id'], scene: Scene, status: SceneStatus) => {
            api.attach_scene_status2scene(scene.id, status.id).then(() => {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', book_uid, 'chapter', scene.chapterId, 'scene', scene.id],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', book_uid, 'sceneStatuses'],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
            })
        },
        [api, queryClient]
    )

    const updateScene = useCallback(
        async (scene: Scene) => {
            const mutation = await changeScene.mutate(scene)
            if (scene.id === activeScene?.id) {
                activeElement.setSceneById(scene.chapterId, scene.id)
                _setActiveScene((prior) => ({ ...prior, ...scene }))
            }
            return mutation
        },
        [_setActiveScene, activeElement, activeScene?.id, changeScene]
    )

    const _deleteScene = useMutation({
        mutationFn: ({
            bookId,
            chapterId,
            sceneId
        }: {
            bookId: Book['id']
            chapterId: Chapter['id']
            sceneId: Scene['id']
        }) => api.delete_scene(chapterId, sceneId),
        onSuccess: async (data, { bookId, chapterId, sceneId }, context) => {
            console.log('Deleted scene', data, chapterId, sceneId, context)
            await queryClient.invalidateQueries(['book', bookId, 'chapter', chapterId]).then()
            await queryClient.invalidateQueries(['book', bookId, 'index']).then()

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

    const deleteScene = async (bookId: Book['id'], chapterId: Chapter['id'], sceneId: Scene['id']) => {
        console.log('Deleting scene: ', chapterId, sceneId)
        const chapter: Chapter = await getChapter(chapterId)

        const target: Scene | SceneIndex | undefined = find(chapter.scenes, { id: sceneId })

        // eslint-disable-next-line consistent-return
        const newActiveScene: Scene | SceneIndex | undefined = target
            ? find(chapter.scenes, { order: target.order - 1 })
            : undefined

        _deleteScene.mutate({ bookId, chapterId, sceneId })

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
        attachSceneStatus2Scene
    }
}
