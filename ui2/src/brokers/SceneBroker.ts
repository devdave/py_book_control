import { useCallback } from 'react'
import {
    type Book,
    type Chapter,
    type ChapterIndex,
    type Scene,

    type SceneStatus,
    UniqueId
} from '@src/types'
import { QueryClient, useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query'

import APIBridge from '@src/lib/remote'



export interface SceneBrokerProps {
    api: APIBridge

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
        chapter_id: Scene['chapterId'] | undefined,
        scene_id: Scene['id'] | undefined,
        enabled?: boolean
    ) => UseQueryResult<Scene, Error>
    update: (scene: Scene) => Promise<[Scene, Chapter] | undefined>
    create: (
        bookIe: Book['id'],
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
    queryClient,
}: SceneBrokerProps): SceneBrokerFunctions => {

    const clearAllBooks = useCallback(
        async (): Promise<void> => {
            await queryClient.invalidateQueries({queryKey: ['book'], refetchType:"all"})
            await queryClient.invalidateQueries({queryKey: ['books'], refetchType:"all"})
        }, [queryClient]
    )

    const clearBookCache = useCallback(
        async (book_id: Book['id']): Promise<void> => {
            await queryClient.invalidateQueries({queryKey: ['book', book_id], refetchType:"all"})
        }, [queryClient]
    )

    const fetchScene = useCallback(
        (
            book_id: Book['id'],
            chapter_id: Chapter['id'] | undefined,
            scene_id: Scene['id'] | undefined,
            enabled = true
        ) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Scene, Error>({
                queryFn: () => api.fetch_scene(scene_id as Scene['id']),
                queryKey: ['book', book_id, 'chapter', chapter_id, 'scene', scene_id],
                enabled
            }),
        [api]
    )

    const _addScene = useMutation({
        mutationFn: (newScene: Scene) =>
            api.create_scene(newScene.chapterId as UniqueId, newScene.title as string, newScene.order),
        onSuccess: () => {
            clearAllBooks().then()

        }
    })

    const createScene: (
        bookId: Book["id"],
        chapterId: string,
        sceneTitle: string,
        order?: number,
        content?: string
    ) => Promise<[Scene, Chapter]> = async (
        bookId: Book["id"],
        chapterId: string,
        sceneTitle: string,
        order = -1,
        content = ''
    ) =>
        new Promise((resolve, reject) => {
            const new_scene = {
                chapterId,
                title: sceneTitle,
                order,
                content
            }

            const invalidateAndResolve = (response:[Scene,Chapter]) => {
                clearBookCache(bookId).then(()=>resolve(response))
            }

            _addScene.mutate(new_scene as Scene, {
                onError: reject,
                onSuccess: invalidateAndResolve
            })
        })

    const reorderScene = useCallback(
        async (chapter: Chapter | ChapterIndex, from: number, to: number) => {
            await api.reorder_scene(chapter.id, from, to)
            await queryClient.invalidateQueries({queryKey:['book', chapter.book_id, 'chapter', chapter.order]})
        },
        [api, queryClient]
    )

    const changeScene = useMutation({
        mutationFn: (alteredScene: Scene) => api.update_scene(alteredScene.id, alteredScene),
        onSuccess: ([scene, chapter]: [Scene, Chapter]) => {
            console.log('changed scene', scene)

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
                    queryKey: ['book', chapter.book_id],
                    exact: false,
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
                }).then()
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

            await queryClient.invalidateQueries({queryKey:['book', bookId, 'chapter', chapterId]})
            await queryClient.invalidateQueries({queryKey:['book', bookId, 'index']})
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

        _deleteScene.mutate({ bookId, chapterId, sceneId })

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
