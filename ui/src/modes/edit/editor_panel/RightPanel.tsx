import {Accordion, ActionIcon, Center, createStyles, Group, Stack, Text, Textarea, Title} from '@mantine/core'
import {IconGripVertical, IconPlus} from '@tabler/icons-react'
import {find, map} from 'lodash'
import {type FC, useCallback, useRef} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'

import {useEditorContext} from '../Editor.context'
import {ChapterForm} from './ChapterForm'

import SceneList from "./SceneList";
import {Chapter} from "@src/types";


const useStyles = createStyles((theme) => ({
    accordionContent: {
        padding: theme.spacing.xs,
        paddingTop: 0
    }
}))

export interface RightPanelProps {
}

export const RightPanel: FC<RightPanelProps> = () => {
    const {activeChapter, activeScene, addScene, reorderScene, setActiveScene} = useEditorContext()

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
            <details>
                <summary>Book notes</summary>
                <Textarea></Textarea>
            </details>

            <ChapterForm chapter={activeChapter as Chapter}/>
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
            <SceneList key={activeChapter?.updated_on}/>
        </Stack>
    )
}
