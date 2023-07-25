import { useForm } from '@mantine/form'
import React, { useCallback } from 'react'
import { Flex, Indicator, Select, Skeleton, Text, Textarea } from '@mantine/core'

import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'

import { type Scene, type SceneStatus, UniqueId } from '@src/types'
import { ResizeablePanels } from '@src/widget/ResizeablePanels'
import { IndicatedTextarea } from '@src/widget/IndicatedTextarea'

import { modals } from '@mantine/modals'

import { useQueryClient } from '@tanstack/react-query'

import { useAppContext } from '@src/App.context'

import { SceneCharacters } from '@src/modes/edit/common/SceneCharacters'
import { useEditorContext } from '../Editor.context'

interface SceneTextProps {
    scene: Scene
}

const compile_scene2md = (scene: Scene) => {
    if (scene) {
        const content = scene.content !== undefined ? scene.content : ''
        return `## ${scene.title}\n\n${content}`
    }
    return 'Loading...'
}

export const SceneText: React.FC<SceneTextProps> = ({ scene }) => {
    const { api, activeBook, settings } = useAppContext()

    const { activeScene, activeElement, activeChapter, setActiveScene, sceneBroker, sceneStatusBroker } =
        useEditorContext()

    const { data: sceneStatuses } = sceneStatusBroker.fetchAllSceneStatuses(activeBook.id)

    const select_statuses =
        sceneStatuses === undefined
            ? []
            : sceneStatuses.map((status: SceneStatus) => ({ label: status.name, value: status.id }))

    const [debounceTime] = settings.makeState('debounceTime')
    const [dontask2delete] = settings.makeState('dontAskOnClear2Delete')
    const [dontask2split] = settings.makeState('dontAskOnSplit')

    const queryClient = useQueryClient()

    const form = useForm<Partial<Scene>>({
        initialValues: {
            content: compile_scene2md(scene),
            notes: scene ? scene.notes : 'STOP! failed to load...',
            summary: scene ? scene.summary : 'STOP! failed to load...',
            location: scene ? scene.location : 'STOP! Failed to load...'
        }
    })

    const doSplit = useCallback(
        async (response: { [key: string]: unknown }) => {
            console.group('doSplit')

            if (activeScene === undefined || activeChapter === undefined) {
                //These are both undefined
                console.error('Cannot split scenes when there is no active scene or chapter.')
                throw new Error('Cannot split scenes when there is no active scene or chapter.')
            }

            form.setFieldValue(
                'content',
                compile_scene2md({ title: response.title, content: response.content } as Scene)
            )

            const activeSceneId = activeScene.id
            const activeChapId = activeChapter.id
            const newOrder = activeScene.order + 1

            activeScene.content = response.content
            await api.update_scene(activeSceneId, activeScene)

            console.log('Calling broker to create with ', newOrder)
            sceneBroker
                .create(activeChapId, response.split_title, newOrder)
                .then(([new_scene, new_chapter]) => {
                    form.resetDirty()
                    setActiveScene(new_chapter, new_scene)
                })

            // const [newScene, newChapter] = await api.create_scene(
            //     activeChapId,
            //     response.split_title,
            //     activeScene.order + 1
            // )

            console.groupEnd()
        },
        [activeBook.id, activeChapter, activeScene, api, form, queryClient, setActiveScene]
    )

    const handleDeleteResponse = useCallback((bookId: UniqueId, chapterId: UniqueId, sceneId: UniqueId) => {
        if (dontask2delete === true) {
            sceneBroker.delete(bookId, chapterId, sceneId).then()
        } else {
            modals.openConfirmModal({
                modalId: 'shouldDeleteScene',
                title: 'Scene body empty',
                children: (
                    <Text size='sm'>
                        The scene@apos;s content body is empty, do you want to delete this scene?
                    </Text>
                ),
                labels: {
                    confirm: 'Delete scene!',
                    cancel: 'Do not delete scene!'
                },
                onConfirm: () => {
                    sceneBroker.delete(activeBook.id, scene.chapterId, scene.id).then()
                }
            })
        }
    }, [])

    useDebouncedEffect(
        () => {
            async function reprocessMDnSave(): Promise<null | undefined> {
                const response = await api.process_scene_markdown(scene.id, form.values.content as string)

                if (
                    (form.values.content && form.values.content.trim().length === 0) ||
                    response.status === 'empty'
                ) {
                    if (activeChapter === undefined || activeScene === undefined) {
                        alert('Integrity error, active chapter or scene are not set.  How did we get here?')
                        return null
                    }
                    handleDeleteResponse(activeBook.id, activeChapter.id, activeScene.id)
                    return null
                }

                if (response.status === 'error') {
                    console.log('Got a bad response ', response)
                    // form.setValues({ content: sceneMD })
                    form.resetDirty()
                    form.setFieldError('content', response.message)
                    return null
                    // throw new Error(response.message)
                }

                if (response.status === 'split') {
                    console.log('Split!')
                    console.log(response)

                    if (dontask2split === true) {
                        doSplit(response).then(() => {
                            form.resetDirty()
                        })
                        return null
                    }

                    modals.openConfirmModal({
                        modalId: 'splitModal',
                        title: 'Split/add new scene?',
                        children: (
                            <Text size='sm'>
                                You have added a second title to the current scene. Was this a mistake or do
                                you want to create and insert a new after the current scene with the new
                                title?
                            </Text>
                        ),
                        labels: {
                            confirm: 'Do split',
                            cancel: 'Undo/remove second title'
                        },
                        onConfirm: () =>
                            doSplit(response).then(() => {
                                form.resetDirty()
                            }),
                        onCancel: () => console.log('Split cancelled!')
                    })

                    return null
                }

                //Else we're doing some simple update logic

                const new_scene: Partial<Scene> = {
                    id: scene.id,
                    chapterId: scene.chapterId,
                    title: response.title,
                    content: response.content,
                    notes: form.values.notes ? form.values.notes : '',
                    summary: form.values.summary ? form.values.summary : '',
                    location: form.values.location ? form.values.location : ''
                }

                await sceneBroker.update(new_scene as Scene).then((updateResponse) => {
                    if (updateResponse) {
                        const [updatedScene, updatedChapter] = updateResponse
                        if (activeScene?.id === updatedScene.id) {
                            activeElement.setSceneById(updatedScene.chapterId, updatedScene.id)
                            setActiveScene(updatedChapter, updatedScene)
                        }
                    }
                })

                form.resetDirty()
                return null
            }

            if (form.isDirty()) {
                reprocessMDnSave().catch((reason) => {
                    alert(`Failed to reprocess markdown to content: ${reason}`)
                })
            }
        },
        [form.values],
        { delay: debounceTime || 1000, runOnInitialize: false }
    )

    if (scene === undefined) {
        return (
            <Skeleton
                height={100}
                mt={6}
                width='100%'
                radius='xl'
            />
        )
    }

    return (
        <ResizeablePanels>
            <Indicator
                color='red'
                position='top-start'
                processing
                disabled={!form.isDirty('content')}
                style={{
                    height: '100%',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <Textarea
                    required
                    styles={(theme) => ({
                        root: {
                            height: '100%',
                            width: '100%',
                            boxSizing: 'border-box',
                            backgroundColor: theme.colorScheme === 'light' ? 'white' : 'black'
                        },
                        wrapper: {
                            height: '100%',
                            width: '100%',
                            boxSizing: 'border-box'
                        },
                        input: {
                            minHeight: '80vh',
                            width: '100%',
                            boxSizing: 'border-box'
                        }
                    })}
                    autoFocus={activeScene?.id === scene.id}
                    autoCapitalize='sentences'
                    {...form.getInputProps('content')}
                />
            </Indicator>

            <Flex
                direction='column'
                style={{
                    height: '100%',
                    position: 'relative',
                    minWidth: '8rem'
                }}
            >
                <Select
                    data={select_statuses}
                    label={<Text>Status</Text>}
                    searchable
                    creatable
                    getCreateLabel={(query) => <Text>{`Create new status ${query}`}</Text>}
                    onCreate={(query) => ({ value: query, label: query })}
                />
                <details open>
                    <summary>Location</summary>
                    <IndicatedTextarea
                        form={form}
                        formField='location'
                    />
                </details>
                <details
                    open
                    style={{}}
                >
                    <summary>Notes</summary>
                    <IndicatedTextarea
                        form={form}
                        formField='notes'
                    />
                </details>

                <details open>
                    <summary>Summary</summary>
                    <IndicatedTextarea
                        form={form}
                        formField='summary'
                    />
                </details>
                <details open>
                    <summary>Characters</summary>
                    <SceneCharacters scene={scene} />
                </details>

                {/*<Button*/}
                {/*    style={{ position: 'absolute', bottom: '0px' }}*/}
                {/*    onClick={() => deleteScene(scene.chapterId, scene.id)}*/}
                {/*>*/}
                {/*    Delete Scene*/}
                {/*</Button>*/}
            </Flex>
        </ResizeablePanels>
    )
}
