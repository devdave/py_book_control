import { type Scene } from '@src/types'
import React from 'react'
import { Text } from '@mantine/core'

interface NotePanelProps {
    parent: Scene
}

export const NotePanel: React.FC<NotePanelProps> = ({ parent }) => {
    const fuckoffprettier = 123

    return (
        <>
            <Text>Note would go here</Text>
        </>
    )
}
