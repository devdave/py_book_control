import {
    Box,
    Button,
    Center,
    Divider,
    Group,
    Navbar,
    NavLink,
    ScrollArea,
    SegmentedControl,
    Text,
    useMantineTheme
} from '@mantine/core'
import {
    IconArticle,
    IconBook,
    IconChevronRight,
    IconGripVertical,
    IconList,
    IconPlus,
    IconUsers
} from '@tabler/icons-react'
import { map } from 'lodash'
import { type FC, useCallback } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { useAppContext } from '@src/App.context'
import { useEditorContext } from './Editor.context'
import { ActiveElementTypes, ChapterIndex, EditModes } from '../../types'

interface LeftPanelProps {
    index: ChapterIndex[]
}

export const LeftPanel: FC<LeftPanelProps> = ({ index }) => {
    const theme = useMantineTheme()
    const {
        activeChapter,
        activeScene,
        addChapter,
        reorderChapter,
        setActiveChapter,
        setActiveScene,
        setEditMode,
        editMode,
        activeElement
    } = useEditorContext()

    const { activeBook } = useAppContext()

    const onChapterClick = (chapter: ChapterIndex) => {
        console.log('Changing chapters!')
        activeElement.clearSubType()
        activeElement.setChapter(chapter)
        // setActiveChapter(chapter)
    }

    const isThisBookActive = activeElement.isThisBook(activeBook)
    const isThisCharacterActive = activeElement.type === ActiveElementTypes.CHARACTERS

    return (
        <Navbar width={{ base: 300 }}>
            {/*<Title order={3}>Chapters</Title>*/}

            <SegmentedControl
                value={editMode}
                onChange={setEditMode}
                data={[
                    {
                        value: EditModes.LIST,
                        label: (
                            <Center>
                                <IconList />
                                <Box ml={10}>Detailed</Box>
                            </Center>
                        )
                    },
                    {
                        value: EditModes.FLOW,
                        label: (
                            <Center>
                                <IconArticle />
                                <Box ml={10}>Flow</Box>
                            </Center>
                        )
                    }
                ]}
            />

            <Divider color={theme.colorScheme === 'light' ? theme.colors.gray[3] : theme.colors.dark[4]} />
            <Button
                size='xs'
                color={theme.colorScheme === 'light' ? theme.colors.gray[3] : theme.colors.dark[4]}
                onClick={() => addChapter()}
            >
                <IconPlus />
                Create new chapter
            </Button>

            <Divider color={theme.colorScheme === 'light' ? theme.colors.gray[3] : theme.colors.dark[4]} />
            <ScrollArea>
                {/*Book link*/}
                <NavLink
                    childrenOffset={0}
                    label={`Book: ${activeBook.title}`}
                    active={isThisBookActive}
                    onChange={() => activeElement.setBook(activeBook)}
                    opened
                    icon={
                        <Center>
                            <IconBook />
                        </Center>
                    }
                >
                    {/* Characters */}
                    <NavLink
                        childrenOffset={1}
                        label='Characters'
                        active={isThisCharacterActive}
                        onClick={() =>
                            activeElement.setTypeAndSubtype(
                                ActiveElementTypes.CHARACTERS,
                                undefined,
                                undefined,
                                undefined
                            )
                        }
                        icon={
                            <Center>
                                <IconUsers />
                            </Center>
                        }
                    />

                    <DragDropContext
                        onDragEnd={useCallback(
                            ({ destination, source }) => {
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
                                    {map(index, (chapter, chapterIdx) => {
                                        const isChapterActive = activeElement.isThisChapter(chapter)
                                        // const isChapterActive = chapter.id === activeChapter?.id

                                        return (
                                            <Draggable
                                                draggableId={chapter.id}
                                                index={chapterIdx}
                                                key={`${chapter.id} ${chapter.updated_on}`}
                                            >
                                                {(draggable) => (
                                                    <NavLink
                                                        active={isChapterActive}
                                                        childrenOffset={1}
                                                        icon={
                                                            <Center {...draggable.dragHandleProps}>
                                                                <IconGripVertical size='0.75rem' />
                                                            </Center>
                                                        }
                                                        label={
                                                            <Group noWrap>
                                                                <Text weight='bold'>
                                                                    {chapter.order + 1}.
                                                                </Text>
                                                                <Text>{chapter.title}</Text>
                                                            </Group>
                                                        }
                                                        onClick={() => onChapterClick(chapter)}
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
                                                        {chapter.scenes
                                                            .sort((a, b) => a.order - b.order)
                                                            .map((scene) => {
                                                                const isSceneActive =
                                                                    activeElement.isThisScene(scene)

                                                                // const isSceneActive = scene.id === activeScene?.id

                                                                return (
                                                                    <NavLink
                                                                        active={isSceneActive}
                                                                        key={`${scene.id} ${scene.updated_on}`}
                                                                        label={
                                                                            <Group
                                                                                align='start'
                                                                                noWrap
                                                                                pl='xl'
                                                                            >
                                                                                <Text weight='bold'>
                                                                                    {chapter.order + 1}.
                                                                                    {scene.order + 1}.
                                                                                </Text>
                                                                                <Text>{scene.title}</Text>
                                                                            </Group>
                                                                        }
                                                                        onClick={() =>
                                                                            setActiveScene(chapter, scene)
                                                                        }
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
                </NavLink>
            </ScrollArea>
        </Navbar>
    )
}
