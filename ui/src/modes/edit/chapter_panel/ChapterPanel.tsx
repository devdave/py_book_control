import { Text } from '@mantine/core'
import React from 'react'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { type Chapter } from '@src/types'

interface ChapterPanelProps {
    chapter: Chapter
}

export const ChapterPanel: React.FC<ChapterPanelProps> = ({ chapter }) => {
    //Let's see what we got
    console.log('ActiveChapter', chapter)

    return (
        <>
            <Text>Chapter Panel</Text>
        </>
    )
}
