import React, { useCallback, useState } from 'react'
import { Center, LoadingOverlay, Select, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { Character, type Scene } from '@src/types'
import { resolveBaseUrl } from 'vite'

interface CharactersSceneFormProps {
    scene: Scene
}
export const CharactersSceneForm: React.FC<CharactersSceneFormProps> = ({ scene }) => {
    const { api, activeBook } = useAppContext()
    const { activeChapter } = useEditorContext()

    const queryClient = useQueryClient()
    const [query, setQuery] = useState('')

    const {
        data: allToons,
        isLoading: toonsIsLoading,
        status: toonStatus
    } = useQuery({
        queryKey: ['book', activeBook.id, 'characters'],
        queryFn: () => api.list_all_characters()
    })

    const {
        data: sceneCharacters,
        isLoading: seceneCharactersIsLoading,
        status: sceneCharactersStatus
    } = useQuery({
        queryKey: ['book', activeBook.id, 'scene', scene.id, 'characters'],
        queryFn: () => api.list_characters_by_scene(scene.id)
    })

    if (toonsIsLoading || seceneCharactersIsLoading) {
        return <LoadingOverlay visible />
    }

    if (toonStatus === 'error') {
        return <Text>Problem loading all characters list</Text>
    }

    if (sceneCharactersStatus === 'error') {
        return <Text>Problem loading all scene characters list</Text>
    }

    const mappedToons = allToons.map((toon: Character) => ({
        value: toon.id,
        label: toon.name
    }))

    return (
        <>
            <Select
                searchable
                creatable
                data={mappedToons}
                value={query}
                onChange={(new_name) => {
                    new_name && setQuery(new_name)
                    api.add_and_or_create_new_character_to_scene(
                        activeBook.id,
                        scene.id,
                        new_name
                    )
                    return new_name
                }}
                onCreate={(new_name) => {
                    api.add_and_or_create_new_character_to_scene(
                        activeBook.id,
                        scene.id,
                        new_name
                    ).then()
                    queryClient
                        .invalidateQueries([
                            ['book', activeBook.id, 'scene', scene.id, 'characters'],
                            ['book', activeBook.id, 'characters']
                        ])
                        .then()
                    //update scene.characters useQuery
                    //update book.characters useQuery
                    return undefined
                }}
            />
            <Title order={2}>Scene Characters</Title>
            {sceneCharacters.map((toon: Character) => (
                <Text key={toon.id}>{toon.name}</Text>
            ))}
        </>
    )
}
