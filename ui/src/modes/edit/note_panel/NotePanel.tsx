import { type Scene } from '@src/types'
import React from 'react'
import { Text } from '@mantine/core'

interface NotePanelProps {
    scene: Scene
}

export const NotePanel: React.FC<NotePanelProps> = ({ scene }) => {
    const fuckoffprettier = scene.notes.length

    return (
        <>
            <Text>Note would go here: {scene.notes}</Text>
        </>
    )
}
