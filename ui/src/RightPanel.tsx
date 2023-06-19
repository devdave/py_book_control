import {Accordion, ActionIcon, Center, createStyles, Group, Stack, Text, Title} from '@mantine/core'
import {IconGripVertical, IconPlus} from '@tabler/icons-react'
import {find, map} from 'lodash'
import {type FC, useCallback, useRef} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'

import {useBookContext} from './Book.context'
import {ChapterForm} from './ChapterForm'

import SceneList from "./SceneList";


const useStyles = createStyles((theme) => ({
    accordionContent: {
        padding: theme.spacing.xs,
        paddingTop: 0
    }
}))

export interface RightPanelProps {
}

export const RightPanel: FC<RightPanelProps> = () => {
    const {activeChapter, activeScene, addScene, reorderScene, setActiveScene} = useBookContext()

    //const {classes} = useStyles()

    if (activeChapter === undefined) {
        return (
            <>
                No active chapter
            </>
        );
    }


    return (
        <Stack spacing='xs'>
            <Title order={4}>Chapter {activeChapter.order+1}</Title>
            <ChapterForm chapter={activeChapter}/>
            <Group
                position='apart'
                spacing='xs'
                p='xs'
                pr='lg'
            >
                <Title order={4}>Scenes</Title>
                <ActionIcon
                    color='blue'
                    onClick={useCallback(() => addScene(activeChapter.id), [activeChapter, addScene])}
                    size='xs'
                    title='Add scene'
                    aria-label='Add scene'
                    variant='subtle'
                >
                    <IconPlus/>
                </ActionIcon>
            </Group>
            <SceneList/>
        </Stack>
    )
}
