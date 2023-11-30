import APIBridge from '@src/lib/remote'
import { useCallback } from 'react'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { Book, Character, Scene } from '@src/types'

export interface CharacterBrokerProps {
    api: APIBridge
    queryClient: QueryClient
}

export interface CharacterBrokerFunctions {
    createAndAdd2Scene: (book:Book, scene: Scene, new_name: string) => undefined
    get: (
        book_id: Book['id'],
        character_id: Character['id'],
        enabled: boolean
    ) => UseQueryResult<Character, Error>
    list: (book: Book) => UseQueryResult<Character[], Error>
    listByScene: (book:Book, scene: Scene) => UseQueryResult<Character[], Error>
    update: (book: Book, changeset: Character) => void
    delete: (book:Book, character_id: Character['id']) => void
    assign2Scene: (book:Book, scene: Scene, char_id: Character['id']) => string
    removeFromScene: (characterId: Character['id'], sceneId: Scene['id']) => Promise<boolean>
}

export const CharacterBroker = ({
    api,
    queryClient,
}: CharacterBrokerProps): CharacterBrokerFunctions => {
    const fetchCharacter = useCallback(
        (
            book_id: Book['id'],
            character_id: Character['id'],
            enabled: boolean
        ): UseQueryResult<Character, Error> => {
            const toon_key = ['book', book_id, 'character', character_id]
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useQuery(
                {
                    queryKey: toon_key,
                    queryFn: () => api.fetch_character(book_id, character_id),
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

    const _updateCharacter = useMutation<Character, Error, {book: Book, character: Character}>({
        mutationFn: ({book, character}) => api.update_character(book.id, character),
        onSuccess: (updated_character, {book}) => {
            queryClient.setQueryData(
                ['book', book.id, 'character', updated_character.id],
                () => updated_character
            )

            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'character', updated_character.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient.setQueryData(['book', book.id, 'characters'], (original) =>
                _updateCharacterQueryCacheData(original as Character[], updated_character)
            )

            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'characters'],
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
        (book: Book, character: Character) => {
            _updateCharacter.mutate({book, character})
        },
        [_updateCharacter]
    )

    const deleteCharacter = useCallback(
        (book: Book, character_id: string) => {
            api.delete_character(character_id).then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'character', character_id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        },
        [api, queryClient]
    )

    const assignCharacter2Scene = useCallback(
        (book: Book, scene: Scene, char_id: Character['id']) => {
            api.add_character_to_scene(scene.id, char_id).then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'chapter', scene.chapterId, 'scene', scene.id],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'scene', scene.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()

            queryClient
                .invalidateQueries({
                    queryKey: ['book', book.id, 'characters'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            return char_id
        },
        [api, queryClient]
    )

    const createNewCharacterAndAdd2Scene = useCallback(
        (activeBook:Book, scene: Scene, new_name: string) => {
            api.create_new_character_to_scene(activeBook.id, scene.id, new_name).then((new_scene) => {

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
        [api, queryClient]
    )

    const listCharactersByScene = useCallback(
        (activeBook: Book, scene: Scene): UseQueryResult<Character[], Error> =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery({
                queryKey: ['book', activeBook.id, 'scene', scene.id, 'characters'],
                queryFn: () => api.list_characters_by_scene(scene.id)
            }),
        [api]
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
