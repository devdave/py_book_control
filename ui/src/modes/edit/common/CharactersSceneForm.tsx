import React, { useState } from 'react'
import { LoadingOverlay, Select, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useQueryClient } from '@tanstack/react-query'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { ActiveElementSubTypes, ActiveElementTypes, Character, type Scene } from '@src/types'

interface CharactersSceneFormProps {
    scene: Scene
}
export const CharactersSceneForm: React.FC<CharactersSceneFormProps> = ({ scene }) => {
    const { api, activeBook } = useAppContext()
    const {
        activeChapter,
        activeElement,
        assignCharacter2Scene,
        createNewCharacterAndAdd2Scene,
        listAllCharacters,
        listCharactersByScene,
        setActiveScene
    } = useEditorContext()

    const queryClient = useQueryClient()
    const [query, setQuery] = useState('')

    const { data: toons, isLoading: toonsIsLoading, status: toonStatus } = listAllCharacters(activeBook)

    const {
        data: sceneCharacters,
        isLoading: sceneCharactersIsLoading,
        status: sceneCharactersStatus
    } = listCharactersByScene(scene)

    if (toonsIsLoading || sceneCharactersIsLoading) {
        return <LoadingOverlay visible />
    }

    if (toonStatus === 'error') {
        return <Text>Problem loading all characters list</Text>
    }

    if (sceneCharactersStatus === 'error') {
        return <Text>Problem loading all scene characters list</Text>
    }

    const mappedToons = toons.map((toon: Character) => ({
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
                onChange={(char_id) => char_id && assignCharacter2Scene(scene, char_id)}
                getCreateLabel={(create_name) => `+ Create new character ${create_name}?`}
                onCreate={(new_name) => createNewCharacterAndAdd2Scene(scene, new_name)}
            />
            <Title order={2}>Scene Characters (click to see detail view)</Title>
            {sceneCharacters.map((toon: Character) => (
                <Text
                    key={toon.id}
                    data-id={toon.id}
                    style={{
                        cursor: 'pointer'
                    }}
                    onClick={(evt) =>
                        activeElement.setTypeAndSubtype(
                            ActiveElementTypes.CHARACTERS,
                            undefined,
                            ActiveElementSubTypes.CHARACTER,
                            toon.id
                        )
                    }
                >
                    {toon.name}
                </Text>
            ))}
        </>
    )
}
