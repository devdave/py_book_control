import { ActionIcon, Group, Stack, Textarea, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { type FC, useCallback } from 'react'

import { Chapter } from '@src/types'
import { InputModal } from '@src/widget/input_modal'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { useEditorContext } from '../Editor.context'
import { ChapterForm } from './ChapterForm'

import SceneList from './SceneList'

export const RightPanel: FC = () => {
    const { activeChapter, setActiveScene, sceneBroker } = useEditorContext()

    const onClickAddScene = useCallback(() => {
        if (!activeChapter) {
            ShowError('Error', 'Cannot add scene, missing active chapter')
            return
        }
        InputModal.Show('A new scene title').then((new_title) => {
            if (new_title.length < 3) {
                ShowError('Error', 'A new scene needs to be at least 3 characters wrong')
                return
            }
            sceneBroker.create(activeChapter.id, new_title).then(([scene, chapter]) => {
                setActiveScene(chapter, scene)
            })
        })
    }, [activeChapter, sceneBroker])

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
