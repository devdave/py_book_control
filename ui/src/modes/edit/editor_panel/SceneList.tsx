import { Accordion, Button, Center, createStyles, Group, Text } from '@mantine/core'
import { useCallback, useEffect, useRef } from 'react'
import { IconGripVertical } from '@tabler/icons-react'
import { find, map } from 'lodash'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Scene } from '@src/types'
import { useHotkeys } from '@mantine/hooks'
import { InputModal } from '@src/widget/input_modal'
import { ScenePanel } from './ScenePanel'
import { useEditorContext } from '../Editor.context'

const useStyles = createStyles((theme) => ({
    accordionContent: {
        padding: theme.spacing.xs,
        paddingTop: 0
    }
}))

const SceneList = () => {
    const { activeChapter, activeScene, sceneBroker, setActiveScene } = useEditorContext()
    const { classes } = useStyles()
    const accordionRefs = useRef<Record<string, HTMLDivElement>>({})

    useEffect(() => {
        if (activeScene) {
            accordionRefs.current[activeScene.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }
    }, [activeScene?.id])

    const onChangeScene = useCallback(
        (sceneId: string) => {
            if (activeChapter) {
                const scene = find(activeChapter.scenes, ['id', sceneId])

                if (scene) {
                    setActiveScene(activeChapter, scene)
                }
            }
        },
        [activeChapter, setActiveScene]
    )

    const onChapterDrop = useCallback(
        ({ destination, source }: { destination: any; source: any }) => {
            if (destination && destination.index !== source.index) {
                if (activeChapter) {
                    sceneBroker.reorder(activeChapter, source.index, destination.index).then()
                }
            }
        },
        [activeChapter, sceneBroker]
    )

    const addNewScene = useCallback(() => {
        if (activeChapter) {
            new InputModal().arun('Provide a new scene name').then((scene_name) => {
                if (scene_name && scene_name.length && scene_name.length > 2) {
                    sceneBroker.create(activeChapter.id, scene_name).then()
                } else {
                    //TODO switch to notification
                    alert('New scenes need to be 3 or more characters long.')
                }
            })
        }
    }, [activeChapter, sceneBroker])

    const goPriorScene = useCallback(() => {
        if (activeScene && activeScene.order > 0 && activeChapter) {
            const prior_scene = find(activeChapter.scenes, { order: activeScene.order - 1 })
            if (prior_scene) {
                setActiveScene(activeChapter, prior_scene)
            }
        }
    }, [activeChapter, activeScene, setActiveScene])

    const goNextScene = useCallback(() => {
        if (activeScene && activeChapter && activeScene.order + 1 < activeChapter.scenes.length) {
            const next_scene = find(activeChapter.scenes, { order: activeScene.order + 1 })
            if (next_scene) {
                setActiveScene(activeChapter, next_scene)
            }
        }
    }, [activeScene, activeScene])

    useHotkeys([
        ['ctrl+PageUp', () => goPriorScene()],
        ['ctrl+PageDown', () => goNextScene()]
    ])

    if (activeChapter === undefined) {
        return (
            <Group position='center'>
                <h2>Create a new Chapter</h2>
            </Group>
        )
    }

    if (activeScene === undefined || activeChapter?.scenes?.length <= 0) {
        return (
            <Group position='center'>
                <Button onClick={addNewScene}>Create a new scene</Button>
            </Group>
        )
    }

    return (
        <>
            <Accordion
                variant='contained'
                radius='md'
                value={activeScene.id}
                classNames={{
                    content: classes.accordionContent
                }}
                onChange={onChangeScene}
            >
                <DragDropContext onDragEnd={onChapterDrop}>
                    <Droppable droppableId='scene-list'>
                        {(droppable) => (
                            <div
                                {...droppable.droppableProps}
                                ref={droppable.innerRef}
                            >
                                {map(activeChapter?.scenes, (scene: Scene, sceneIdx) => (
                                    <Draggable
                                        draggableId={scene.id}
                                        index={sceneIdx}
                                        key={scene.id}
                                    >
                                        {(draggable) => (
                                            <Accordion.Item
                                                ref={(ref) => {
                                                    draggable.innerRef(ref)
                                                    if (ref) {
                                                        accordionRefs.current[scene.id] = ref
                                                    }
                                                }}
                                                value={scene.id}
                                                {...draggable.draggableProps}
                                            >
                                                <Accordion.Control
                                                    icon={
                                                        <Center {...draggable.dragHandleProps}>
                                                            <IconGripVertical size='0.75rem' />
                                                        </Center>
                                                    }
                                                >
                                                    <Text weight='bold'>Scene #{scene.order + 1}</Text>
                                                </Accordion.Control>
                                                <Accordion.Panel>
                                                    <ScenePanel
                                                        key={scene.updated_on}
                                                        indexedScene={scene}
                                                    />
                                                </Accordion.Panel>
                                            </Accordion.Item>
                                        )}
                                    </Draggable>
                                ))}
                                {droppable.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Accordion>
            <Group position='center'>
                <Button onClick={addNewScene}>Create a new scene</Button>
            </Group>
        </>
    )
}

export default SceneList
