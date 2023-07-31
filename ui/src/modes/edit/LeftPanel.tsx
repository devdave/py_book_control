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
    IconFlagFilled,
    IconGripVertical,
    IconList,
    IconPlus,
    IconUsers
} from '@tabler/icons-react'
import { map } from 'lodash'
import { type FC, useCallback } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { useAppContext } from '@src/App.context'
import { ActiveElementSubTypes, ActiveElementTypes, ChapterIndex, EditModes } from '@src/types'
import { InputModal } from '@src/widget/input_modal'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { LeftPanelScene } from '@src/modes/edit/LeftPanelScene'
import { useEditorContext } from './Editor.context'

interface LeftPanelProps {
    index: ChapterIndex[]
}

export const LeftPanel: FC<LeftPanelProps> = ({ index }) => {
    const theme = useMantineTheme()
    const { chapterBroker, setEditMode, editMode, activeElement } = useEditorContext()

    const { activeBook } = useAppContext()

    const onChapterClick = (chapter: ChapterIndex) => {
        console.log('Changing chapters!')
        activeElement.clearSubType()
        activeElement.setChapter(chapter)
        // setActiveChapter(chapter)
    }

    const handleCreateChapter = () => {
        InputModal.Show('Provide a chapter name').then((new_title) => {
            if (new_title.length < 3) {
                ShowError('Error', "A new chapter's title needs to be 3 characters long.")
                return
            }
            chapterBroker
                .create(activeBook.id, new_title)
                .then((new_chapter) => {
                    if (new_chapter) {
                        console.log('Got a new chapter', new_chapter)
                    } else {
                        ShowError('Error', 'There was an unexpected problem creating a new chapter.')
                    }
                })
                .catch((error) => {
                    ShowError('Error', `Got the following when attempting to create a new chapter: ${error}`)
                })
        })
    }

    const isThisBookActive = activeElement.isThisBook(activeBook)
    const isCharactersActive = activeElement.isCharactersActive()

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
                onClick={handleCreateChapter}
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
                        active={isCharactersActive}
                        onClick={() => activeElement.setTypeToCharacters()}
                        opened
                        icon={
                            <Center>
                                <IconUsers />
                            </Center>
                        }
                    />
                    <NavLink
                        childrenOffset={1}
                        label='Statuses'
                        active={activeElement.typeIs(ActiveElementTypes.STATUSES)}
                        onClick={() => activeElement.setType(ActiveElementTypes.STATUSES)}
                        icon={
                            <Center>
                                <IconFlagFilled />
                            </Center>
                        }
                    />

                    <DragDropContext
                        onDragEnd={useCallback(
                            ({ destination, source }) => {
                                if (destination && destination.index !== source.index) {
                                    chapterBroker.reorder(activeBook.id, source.index, destination.index)
                                }
                            },
                            [activeBook.id, chapterBroker]
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
                                                            .map((scene) => (
                                                                <LeftPanelScene
                                                                    key={`${scene.id}-${scene.updated_on}`}
                                                                    sceneIndex={scene}
                                                                    chapterIndex={chapter}
                                                                />
                                                            ))}
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
