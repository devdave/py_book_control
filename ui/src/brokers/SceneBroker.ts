import { Dispatch, SetStateAction, useCallback } from 'react'
import {
    attachSceneStatus2SceneProps,
    type Book,
    type Chapter,
    type ChapterIndex,
    type Scene,
    type SceneIndex,
    type SceneStatus,
    UniqueId
} from '@src/types'
import { QueryClient, useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query'
import { clone, find } from 'lodash'
import APIBridge from '@src/lib/remote'
import { useActiveElementReturn } from '@src/lib/use-active-element'
import { ChapterBrokerFunctions } from '@src/brokers/ChapterBroker'

export interface SceneBrokerProps {
    api: APIBridge
    activeElement: useActiveElementReturn
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
    attachSceneStatus2Scene: (
        bookUid: Book['id'],
        scene: Scene,
        statusUid: SceneStatus['id']
    ) => Promise<boolean>
    change: UseMutationResult<[Scene, Chapter], unknown, Scene>
    fetch: (
        book_id: Book['id'],
        chapter_id: Scene['chapterId'],
        scene_id: Scene['id']
    ) => UseQueryResult<Scene, Error>
    update: (scene: Scene) => Promise<[Scene, Chapter] | undefined>
    create: (
        chapterId: Scene['chapterId'],
        sceneTitle: Scene['title'],
        position?: Scene['order'],
        content?: Scene['content']
    ) => Promise<[Scene, Chapter]>
    reorder: (chapter: Chapter | ChapterIndex, from: number, to: number) => Promise<void>
    delete: (
        bookId: Book['id'],
        chapterId: Scene['chapterId'] | undefined,
        sceneId: Scene['id'] | undefined
    ) => Promise<void>
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
        mutationFn: (newScene: Scene) =>
            api.create_scene(newScene.chapterId as UniqueId, newScene.title as string, newScene.order),
        onSuccess: ([scene, chapter]: [Scene, Chapter], newSceneParts: Partial<Scene>) => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'chapter', chapter.id, 'scene', scene.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then(() => console.log('AddScene - invalidated scene'))

            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'chapter', newSceneParts.chapterId],
                    exact: true,
                    refetchType: 'active'
                })
                .then(() => console.log('AddScene - invalidated chapter'))

            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'index'],
                    exact: true,
                    refetchType: 'active'
                })
                .then(() => console.log('Add scene - invalidated index'))
        }
    })

    const createScene: (
        chapterId: string,
        sceneTitle: string,
        order?: number,
        content?: string
    ) => Promise<[Scene, Chapter]> = async (
        chapterId: string,
        sceneTitle: string,
        order = -1,
        content = ''
    ) =>
        new Promise((resolve) => {
            const new_scene = {
                chapterId,
                title: sceneTitle,
                order,
                content
            }

            _addScene.mutate(new_scene as Scene, {
                onSuccess: (response) => resolve(response)
            })
        })

    const reorderScene = useCallback(
        async (chapter: Chapter | ChapterIndex, from: number, to: number) => {
            await api.reorder_scene(chapter.id, from, to)
            await queryClient.invalidateQueries(['book', chapter.book_id, 'chapter', chapter.order])
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

    const attachSceneStatus2Scene: (
        book_uid: Book['id'],
        scene: Scene,
        statusUid: SceneStatus['id']
    ) => Promise<boolean> = useCallback(
        (book_uid: Book['id'], scene: Scene, statusUid: SceneStatus['id']) =>
            api.attach_scene_status2scene(scene.id, statusUid).then(() => {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', book_uid, 'chapter', scene.chapterId, 'scene', scene.id],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
                queryClient.invalidateQueries({
                    queryKey: ['book', book_uid, 'index'],
                    exact: true,
                    refetchType: 'active'
                })
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', book_uid, 'sceneStatuses'],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
                return true
            }),
        [api, queryClient]
    )

    const updateScene = useCallback(
        async (scene: Scene) =>
            new Promise<[Scene, Chapter] | undefined>((resolve, reject) => {
                changeScene.mutate(scene, { onSuccess: resolve, onError: reject })
            }),

        [changeScene]
    )

    const _deleteScene = useMutation({
        mutationFn: ({
            chapterId,
            sceneId
        }: {
            bookId: Book['id']
            chapterId: Chapter['id']
            sceneId: Scene['id']
        }) => api.delete_scene(chapterId, sceneId),
        onSuccess: async (data, { bookId, chapterId, sceneId }, context) => {
            console.log('Deleted scene', data, chapterId, sceneId, context)

            await queryClient.invalidateQueries(['book', bookId, 'chapter', chapterId])
            await queryClient.invalidateQueries(['book', bookId, 'index'])
        }
    })

    const deleteScene = async (
        bookId: Book['id'],
        chapterId: Chapter['id'] | undefined,
        sceneId: Scene['id'] | undefined
    ) => {
        console.log('Deleting scene: ', chapterId, sceneId)
        if (!sceneId || !chapterId) {
            console.error('Attempting to delete undefined chapter or scene')
            console.trace()
            return
        }
        const chapter: Chapter = await getChapter(chapterId, false)

        const target: Scene | SceneIndex | undefined = find(chapter.scenes, { id: sceneId })

        //TODO if I delete the first scene in a chapter where target.order === 0, it should
        // jump to scene.order == 1

        // eslint-disable-next-line consistent-return
        const newActiveScene: Scene | SceneIndex | undefined = target
            ? find(chapter.scenes, { order: Math.max(0, target.order - 1) })
            : undefined

        _deleteScene.mutate({ bookId, chapterId, sceneId })

        _setActiveChapter((prior): Chapter | ChapterIndex | undefined => {
            if (prior === undefined) {
                console.log('Error: somehow the user deleted a scene without there being an active chapter')
                throw Error('Integrity issue: Deleted a scene without an active scene')
            }
            const updated: ChapterIndex | Chapter = clone(prior)
            updated.scenes = prior.scenes.filter((scene) => scene.id !== sceneId)
            updated.updated_on = new Date(Date.now()).toUTCString()

            // eslint-disable-next-line consistent-return
            return updated
        })

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
