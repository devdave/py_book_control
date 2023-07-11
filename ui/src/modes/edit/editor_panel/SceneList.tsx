import { Accordion, Button, Center, createStyles, Group, Text, Title } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { IconGripVertical } from '@tabler/icons-react';
import { find, map } from 'lodash';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Scene } from '@src/types';
import { ScenePanel } from './ScenePanel';
import { useEditorContext } from '../Editor.context';

const useStyles = createStyles((theme) => ({
    accordionContent: {
        padding: theme.spacing.xs,
        paddingTop: 0
    }
}))

const SceneList = () => {
    const { activeChapter, activeScene, addScene, reorderScene, setActiveScene } = useEditorContext()
    const { classes } = useStyles();
    const accordionRefs = useRef<Record<string, HTMLDivElement>>({});

    useEffect(() => {
        if (activeScene) {
            accordionRefs.current[activeScene.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }
    }, [activeScene?.id]);

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
                    ({ destination, source }:{ destination:any, source:any }) => {
                        if (destination && destination.index !== source.index) {
                            if (activeChapter) {
                                reorderScene(activeChapter.id, source.index, destination.index)
                            }
                        }
                    },
                    [activeChapter?.id, reorderScene]
                )

    // @ts-ignore I don't care that activeChapter might be undefined
    const addNewScene = useCallback(() => addScene(activeChapter.id), [activeChapter, addScene])

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
            <DragDropContext
                onDragEnd={onChapterDrop}
            >
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
                                                draggable.innerRef(ref);
                                                if (ref) {
                                                    accordionRefs.current[scene.id] = ref;
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
                                                <ScenePanel key={scene.content} indexedScene={scene} />
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
    );
};

export default SceneList;
