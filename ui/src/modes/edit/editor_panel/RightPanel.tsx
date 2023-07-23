import { ActionIcon, Group, Stack, Textarea, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { type FC, useCallback } from 'react'

import { Chapter } from '@src/types'
import { useEditorContext } from '../Editor.context'
import { ChapterForm } from './ChapterForm'

import SceneList from './SceneList'

export const RightPanel: FC = () => {
    const { activeChapter, sceneBroker } = useEditorContext()

    const onClickAddScene = useCallback(
        () => activeChapter && sceneBroker.add(activeChapter.id),
        [activeChapter, sceneBroker]
    )

    if (activeChapter === undefined) {
        return <>No active chapter</>
    }

    return (
        <Stack spacing='xs'>
            <details>
                <summary>Book notes</summary>
                <Textarea />
            </details>

            <ChapterForm chapter={activeChapter as Chapter} />
            <Group
                position='apart'
                spacing='xs'
                p='xs'
                pr='lg'
            >
                <Title order={4}>Scenes</Title>
                <ActionIcon
                    color='blue'
                    onClick={onClickAddScene}
                    size='xs'
                    title='Add scene'
                    aria-label='Add scene'
                    variant='subtle'
                >
                    <IconPlus />
                </ActionIcon>
            </Group>
            <SceneList key={activeChapter?.updated_on} />
        </Stack>
    )
}
