import { Book, Scene, SceneStatus } from '@src/types'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import APIBridge from '@src/lib/remote'

export interface SceneStatusBrokerProps {
    api: APIBridge
    queryClient: QueryClient
}

export interface _updateSceneStatusArgs {
    book_uid: Book['id']
    status_uid: SceneStatus['id']
    changeset: SceneStatus
}

export interface SceneStatusBrokerFunctions {
    deleteSceneStatus: (book_uid: Book['id'], status_uid: SceneStatus['id']) => void
    fetchAllSceneStatuses: (book_id: Book['id']) => UseQueryResult<SceneStatus[], Error>
    updateSceneStatus: (book_uid: Book['id'], status_uid: SceneStatus['id'], changeset: SceneStatus) => void
    createSceneStatus: (name: SceneStatus['name'], book: Book, scene?: Scene) => void
    fetchSceneStatus: (
        book_uid: Book['id'],
        status_uid: SceneStatus['id']
    ) => UseQueryResult<SceneStatus, Error>
}

export type SceneStatusBrokerType = ({
    api,
    queryClient
}: SceneStatusBrokerProps) => SceneStatusBrokerFunctions

export const SceneStatusBroker: SceneStatusBrokerType = ({ api, queryClient }: SceneStatusBrokerProps) => {
    const fetchAllSceneStatuses = (book_id: Book['id']): UseQueryResult<SceneStatus[], Error> =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ['book', book_id, 'sceneStatuses'],
            queryFn: () => api.fetch_all_scene_statuses(book_id)
        })

    const fetchSceneStatus = (
        book_uid: Book['id'],
        status_uid: SceneStatus['id']
    ): UseQueryResult<SceneStatus, Error> =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ['book', book_uid, 'sceneStatus', status_uid],
            queryFn: () => api.fetch_scene_status(status_uid)
        })

    const createSceneStatus = (name: SceneStatus['name'], book: Book, scene?: Scene) => {
        api.create_scene_status(name, book.id, scene?.id).then(() => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            if (scene) {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', book.id, 'chapter', scene.chapterId, 'scene', scene.id],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
            }
        })
    }

    const _updateSceneStatus = useMutation({
        mutationKey: ['sceneStatus', 'updating'],
        mutationFn: ({ status_uid, changeset }: _updateSceneStatusArgs) =>
            api.update_scene_status(status_uid, changeset),
        onSuccess: (new_status: SceneStatus, params: _updateSceneStatusArgs) => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', params.book_uid, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })
    const updateSceneStatus = (book_uid: Book['id'], status_uid: SceneStatus['id'], changeset: SceneStatus) =>
        _updateSceneStatus.mutate({ status_uid, book_uid, changeset })

    const deleteSceneStatus = (book_uid: Book['id'], status_uid: SceneStatus['id']) => {
        api.delete_scene_status(status_uid).then(() => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', book_uid, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        })
    }

    return {
        deleteSceneStatus,
        updateSceneStatus,
        createSceneStatus,
        fetchSceneStatus,
        fetchAllSceneStatuses
    }
}
