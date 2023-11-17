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
    delete: (book_uid: Book['id'], status_uid: SceneStatus['id']) => void
    fetchAll: (book_id: Book['id'], enabled: boolean) => UseQueryResult<SceneStatus[], Error>
    update: (book_uid: Book['id'], status_uid: SceneStatus['id'], changeset: SceneStatus) => void
    create: (
        book_uid: Book['id'],
        name: SceneStatus['name'],
        color: SceneStatus['color'],
        scene?: Scene
    ) => Promise<SceneStatus>
    fetch: (
        book_uid: Book['id'],
        status_uid: SceneStatus['id'],
        enabled: boolean
    ) => UseQueryResult<SceneStatus, Error>
    get: (sceneStatusId: SceneStatus['id']) => Promise<SceneStatus>
}

export type SceneStatusBrokerType = ({
    api,
    queryClient
}: SceneStatusBrokerProps) => SceneStatusBrokerFunctions

export const SceneStatusBroker: SceneStatusBrokerType = ({ api, queryClient }: SceneStatusBrokerProps) => {
    const fetchAllSceneStatuses = (
        book_id: Book['id'],
        enabled: boolean
    ): UseQueryResult<SceneStatus[], Error> =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ['book', book_id, 'sceneStatuses'],
            queryFn: () => api.fetch_all_scene_statuses(book_id),
            enabled
        })

    const fetchSceneStatus = (
        book_uid: Book['id'],
        status_uid: SceneStatus['id'],
        enabled: boolean
    ): UseQueryResult<SceneStatus, Error> =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ['book', book_uid, 'sceneStatus', status_uid],
            queryFn: () => api.fetch_scene_status(status_uid),
            enabled
        })

    const getSceneStatus = async (sceneStatusUid: SceneStatus['id']) => api.fetch_scene_status(sceneStatusUid)

    const createSceneStatus = (
        book_uid: Book['id'],
        name: SceneStatus['name'],
        color: SceneStatus['color'],
        scene?: Scene
    ) =>
        api.create_scene_status(book_uid, name, color, scene?.id).then((new_status: SceneStatus) => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', book_uid, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            if (scene) {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', book_uid, 'chapter', scene.chapterId, 'scene', scene.id],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
            }
            return new_status
        })

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

    const deleteSceneStatus = (book_uid: Book['id'], status_uid: SceneStatus['id']) =>
        api.delete_scene_status(status_uid).then(() => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', book_uid, 'sceneStatuses'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        })

    return {
        delete: deleteSceneStatus,
        update: updateSceneStatus,
        create: createSceneStatus,
        fetch: fetchSceneStatus,
        get: getSceneStatus,
        fetchAll: fetchAllSceneStatuses
    }
}
