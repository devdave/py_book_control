import { Select, Text } from '@mantine/core'
import { Character, Scene } from '@src/types'
import { useAppContext } from '@src/App.context'
import { map, values } from 'lodash'
import { useEditorContext } from '@src/modes/edit/Editor.context'

interface SceneCharactersProps {
    scene: Scene
}

export const SceneCharacters: React.FC<SceneCharactersProps> = ({ scene }) => {
    const { activeBook } = useAppContext()
    const { characterBroker } = useEditorContext()

    const { data: sceneCharacters } = characterBroker.listByScene(scene)

    const toons_list =
        sceneCharacters === undefined
            ? []
            : sceneCharacters.map((toon: Character) => ({ label: toon.name, value: toon.id }))

    return (
        <>
            <Select
                data={toons_list}
                searchable
                creatable
            />
            {map(scene.characters, (toon) => (
                <Text key={toon.id}>{toon.name}</Text>
            ))}
        </>
    )
}
