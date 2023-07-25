import { ActionIcon, List, Select, Text } from '@mantine/core'
import { Character, Scene } from '@src/types'
import { useAppContext } from '@src/App.context'

import { useEditorContext } from '@src/modes/edit/Editor.context'
import { IconUser, IconEye, IconX } from '@tabler/icons-react'
import { map } from 'lodash'

interface SceneCharactersProps {
    scene: Scene
}

export const SceneCharacters: React.FC<SceneCharactersProps> = ({ scene }) => {
    const { activeBook } = useAppContext()
    const { characterBroker, activeElement } = useEditorContext()

    const { data: allCharacters } = characterBroker.list(activeBook.id)

    const sceneToonIdSet = new Set(scene.characters.map((toon) => toon.id))

    const toons_list =
        allCharacters === undefined
            ? []
            : allCharacters
                  .filter((toon) => !sceneToonIdSet.has(toon.id))
                  .map((toon: Character) => ({ label: toon.name, value: toon.id }))

    const inspectOnClick: React.MouseEventHandler<HTMLButtonElement> = (evt) => {
        const toon_id = evt.currentTarget.dataset.toonId
        if (toon_id) {
            activeElement.setCharacterById(toon_id)
        }
    }

    const disconnectOnClick: React.MouseEventHandler<HTMLButtonElement> = (evt) => {
        const toon_id = evt.currentTarget.dataset.toonId
        if (toon_id) {
            characterBroker.removeFromScene(toon_id, scene.id)
        }
    }

    console.log(scene.title)
    return (
        <>
            <Select
                data={toons_list}
                searchable
                creatable
                icon={<IconUser />}
                getCreateLabel={(query) => <Text>Create {query}?</Text>}
                onChange={(toon_id) => {
                    toon_id && characterBroker.assign2Scene(scene, toon_id)
                }}
            />
            {scene.characters.length > 0 && (
                <table style={{ textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th colSpan={2}>Name</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {map(scene.characters, (toon: Character) => (
                            <tr key={toon.id}>
                                <td>
                                    <ActionIcon
                                        data-toon-id={toon.id}
                                        onClick={inspectOnClick}
                                    >
                                        <IconEye />
                                    </ActionIcon>
                                </td>
                                <td>{toon.name}</td>
                                <td>
                                    <ActionIcon
                                        data-toon-id={toon.id}
                                        onClick={disconnectOnClick}
                                    >
                                        <IconX />
                                    </ActionIcon>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    )
}
