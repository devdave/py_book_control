import APIBridge from '@src/lib/remote'
import { useCallback } from 'react'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { Book, Chapter, ChapterIndex, Character, Scene, UniqueId } from '@src/types'

export interface CharacterBrokerProps {
    api: APIBridge
    queryClient: QueryClient
    activeBook: Book
    activeChapter: Chapter | ChapterIndex | undefined
    setActiveScene: (chapter: Chapter, scene: Scene) => void
}

export interface CharacterBrokerFunctions {
    createAndAdd2Scene: (scene: Scene, new_name: string) => undefined
    get: (
        book_id: Book['id'],
        character_id: Character['id'],
        enabled: boolean
    ) => UseQueryResult<Character, Error>
    list: (bookId: Book['id']) => UseQueryResult<Character[], Error>
    listByScene: (scene: Scene) => UseQueryResult<Character[], Error>
    update: (changeset: Character) => void
    delete: (character_id: Character['id']) => void
    assign2Scene: (scene: Scene, char_id: Character['id']) => string
    removeFromScene: (characterId: Character['id'], sceneId: Scene['id']) => Promise<boolean>
}

export const CharacterBroker = ({
    api,
    queryClient,
    activeBook,
    activeChapter,
    setActiveScene
}: CharacterBrokerProps): CharacterBrokerFunctions => {
    const fetchCharacter = useCallback(
        (
            book_id: Book['id'],
            character_id: Character['id'],
            enabled: boolean
        ): UseQueryResult<Character, Error> => {
            const toon_key = ['book', book_id, 'character', character_id]
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useQuery(toon_key, () => api.fetch_character(book_id, character_id), {
                enabled
            })
        },
        [api]
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
            api.delete_character(character_id).then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            queryClient
                .invalidateQueries({
                    queryKey: ['book', activeBook.id, 'character', character_id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        },
        [api, queryClient, activeBook.id]
    )

    const assignCharacter2Scene = useCallback(
        (scene: Scene, char_id: Character['id']) => {
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
        (bookId: Book['id']): UseQueryResult<Character[], Error> =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery({
                queryKey: ['book', bookId, 'characters'],
                queryFn: () => api.list_all_characters(bookId)
            }),
        [api]
    )

    const removeCharacterFromScene: (characterId: Character['id'], sceneId: Scene['id']) => Promise<boolean> =
        useCallback(
            async (characterId: Character['id'], sceneId: Scene['id']) =>
                api.remove_character_from_scene(characterId, sceneId),
            [api]
        )

    return {
        createAndAdd2Scene: createNewCharacterAndAdd2Scene,
        get: fetchCharacter,
        list: listAllCharacters,
        listByScene: listCharactersByScene,
        update: updateCharacter,
        delete: deleteCharacter,
        assign2Scene: assignCharacter2Scene,
        removeFromScene: removeCharacterFromScene
    }
}
