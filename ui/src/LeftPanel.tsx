import {
    ActionIcon,
    Button,
    Center,
    Divider,
    Group,
    Navbar,
    NavLink,
    ScrollArea,
    Text,
    Title,
    useMantineTheme
} from '@mantine/core'
import {IconArticle, IconChevronRight, IconGripVertical, IconList, IconPlus} from '@tabler/icons-react'
import {map} from 'lodash'
import {type FC, useCallback} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'

import {useBookContext} from './Book.context'
import {ViewModes} from "./types";

interface LeftPanelProps {
}

export const LeftPanel: FC<LeftPanelProps> = () => {
    const theme = useMantineTheme()
    const {
        activeChapter,
        activeScene,
        addChapter,
        chapters,
        reorderChapter,
        setActiveChapter,
        setActiveScene,
        setViewMode,
        viewMode

    } =
        useBookContext()


    return (
        <Navbar width={{base: 300}}>
            <Title order={3}>Chapters</Title>
            <Button.Group key={viewMode}>
                <ActionIcon
                    color='blue'
                    onClick={() => addChapter()}
                    size='xs'
                    title='Add Chapter'
                    variant='subtle'
                >
                    <IconPlus/>
                </ActionIcon>
                <ActionIcon
                    color={viewMode === ViewModes.LIST ? theme.colors.green[6] : theme.colors.blue[6] }
                    size='xs'
                    title='Single page'
                    variant='subtle'
                    onClick={() => setViewMode(ViewModes.LIST)}
                >
                    <IconList />
                </ActionIcon>
                <ActionIcon
                    color={viewMode === ViewModes.LIST ? theme.colors.green[6] : theme.colors.blue[6] }
                    size="xs"
                    variant="subtle"
                    onClick={() => setViewMode(ViewModes.FLOW)}
                >
                    <IconArticle/>
                </ActionIcon>

            </Button.Group>

            <Divider color={theme.colorScheme === 'light' ? theme.colors.gray[3] : theme.colors.dark[4]}/>
            <ScrollArea>
                <DragDropContext
                    onDragEnd={useCallback(
                        ({destination, source}) => {
                            if (destination && destination.index !== source.index) {
                                reorderChapter(source.index, destination.index)
                            }
                        },
                        [reorderChapter]
                    )}
                >
                    <Droppable droppableId='chapter-list'>
                        {(droppable) => (
                            <div
                                {...droppable.droppableProps}
                                ref={droppable.innerRef}
                            >
                                {map(chapters, (chapter, chapterIdx) => {
                                    const isChapterActive = chapter.id === activeChapter?.id

                                    return (
                                        <Draggable
                                            draggableId={chapter.id}
                                            index={chapterIdx}
                                            key={chapter.id}
                                        >
                                            {(draggable) => (
                                                <NavLink
                                                    active={isChapterActive}
                                                    childrenOffset={0}
                                                    icon={
                                                        <Center {...draggable.dragHandleProps}>
                                                            <IconGripVertical size='0.75rem'/>
                                                        </Center>
                                                    }
                                                    label={
                                                        <Group noWrap>
                                                            <Text weight='bold'>{chapter.order + 1}.</Text>
                                                            <Text>{chapter.title}</Text>
                                                        </Group>
                                                    }
                                                    onChange={() => setActiveChapter(chapter)}
                                                    opened={isChapterActive}
                                                    ref={draggable.innerRef}
                                                    rightSection={
                                                        <IconChevronRight
                                                            size='0.9rem'
                                                            stroke={1.5}
                                                        />
                                                    }
                                                    variant='filled'
                                                    {...draggable.draggableProps}
                                                >
                                                    {map(chapter.scenes, (scene) => {
                                                        const isSceneActive = scene.id === activeScene?.id

                                                        return (
                                                            <NavLink
                                                                active={isSceneActive}
                                                                key={scene.updated_on}
                                                                label={
                                                                    <Group
                                                                        align='start'
                                                                        noWrap
                                                                        pl='xl'
                                                                    >
                                                                        <Text weight='bold'>
                                                                            {chapter.order + 1}.{scene.order + 1}.
                                                                        </Text>
                                                                        <Text>{scene.title}</Text>
                                                                    </Group>
                                                                }
                                                                onClick={() => setActiveScene(chapter, scene)}
                                                            />
                                                        )
                                                    })}
                                                </NavLink>
                                            )}
                                        </Draggable>
                                    )
                                })}
                                {droppable.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </ScrollArea>
        </Navbar>
    )
}
