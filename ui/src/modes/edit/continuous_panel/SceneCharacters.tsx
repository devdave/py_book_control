import { ActionIcon, List, Select, Text } from '@mantine/core'
import { Character, Scene } from '@src/types'
import { useAppContext } from '@src/App.context'
import { map, values } from 'lodash'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { IconEye, IconX } from '@tabler/icons-react'

interface SceneCharactersProps {
    scene: Scene
}

export const SceneCharacters: React.FC<SceneCharactersProps> = ({ scene }) => {
    const { activeBook } = useAppContext()
    const { characterBroker, activeElement } = useEditorContext()

    const { data: sceneCharacters } = characterBroker.list(activeBook.id)

    const toons_list =
        sceneCharacters === undefined
            ? []
            : sceneCharacters.map((toon: Character) => ({ label: toon.name, value: toon.id }))

    const inspectOnClick: React.MouseEventHandler<HTMLButtonElement> = (evt) => {
        const toon_id = evt.currentTarget.dataset.toonId
        if (toon_id) {
            activeElement.setCharacterById(toon_id)
        }
    }

    console.log(scene.title)
    return (
        <>
            <Select
                data={toons_list}
                searchable
                creatable
                getCreateLabel={(query) => <Text>Create {query}?</Text>}
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
                        {map(scene.characters, (toon) => (
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
                                    <ActionIcon>
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
