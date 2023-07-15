import React, { useState } from 'react'
import { LoadingOverlay, Select, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { Character, type Scene } from '@src/types'
import { clone } from 'lodash'

interface CharactersSceneFormProps {
    scene: Scene
}
export const CharactersSceneForm: React.FC<CharactersSceneFormProps> = ({ scene }) => {
    const { api, activeBook } = useAppContext()
    const { activeChapter, setActiveScene } = useEditorContext()

    const queryClient = useQueryClient()
    const [query, setQuery] = useState('')

    const {
        data: allToons,
        isLoading: toonsIsLoading,
        status: toonStatus
    } = useQuery({
        queryKey: ['book', activeBook.id, 'characters'],
        queryFn: () => api.list_all_characters(activeBook.id)
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
                label='Find or create new character for scene'
                searchable
                creatable
                data={mappedToons}
                value={query}
                onChange={(char_id) => {
                    api.add_character_to_scene(scene.id, char_id).then((new_scene) =>
                        setActiveScene(activeChapter, new_scene as Scene)
                    )

                    queryClient
                        .invalidateQueries([
                            [
                                'book',
                                activeBook.id,
                                'chapter',
                                scene.chapterId,
                                'scene',
                                scene.id
                            ],
                            ['book', activeBook.id, 'scene', scene.id, 'characters'],
                            ['book', activeBook.id, 'characters']
                        ])
                        .then()
                    return char_id
                }}
                getCreateLabel={(create_name) => `+ Create new character ${create_name}?`}
                onCreate={(new_name) => {
                    api.create_new_character_to_scene(
                        activeBook.id,
                        scene.id,
                        new_name
                    ).then((new_scene) => {
                        setActiveScene(activeChapter, new_scene)
                        queryClient.setQueryData(
                            [
                                'book',
                                activeBook.id,
                                'chapter',
                                scene.chapterId,
                                'scene',
                                scene.id
                            ],
                            new_scene
                        )
                        queryClient.setQueryData(
                            ['book', activeBook.id, 'scene', scene.id, 'characters'],
                            new_scene.characters
                        )
                    })
                    // queryClient
                    //     .invalidateQueries([
                    //         [
                    //             'book',
                    //             activeBook.id,
                    //             'chapter',
                    //             scene.chapterId,
                    //             'scene',
                    //             scene.id
                    //         ],
                    //         ['book', activeBook.id, 'scene', scene.id],
                    //         ['book', activeBook.id, 'index'],
                    //         ['book', activeBook.id, 'scene', scene.id, 'characters'],
                    //         ['book', activeBook.id, 'characters']
                    //     ])
                    //     .then()
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
