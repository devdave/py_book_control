import { Text } from '@mantine/core'
import { Scene } from '@src/types'
import { useAppContext } from '@src/App.context'
import { map } from 'lodash'

interface SceneCharactersProps {
    scene: Scene
}

export const SceneCharacters: React.FC<SceneCharactersProps> = ({ scene }) => {
    const { activeBook } = useAppContext()
    return (
        <>
            <Text>Character</Text>
            {map(scene.characters, (toon) => {
                ;<Text key={toon.id}>{toon.name}</Text>
            })}
        </>
    )
}
