import { Button, Center, Paper, TextInput, Title, Stack } from '@mantine/core'
import { useCallback, useEffect, useRef } from 'react'
import { useForm } from '@mantine/form'
import { useAppContext } from '@src/App.context'
import { Chapter, type Scene } from '@src/types'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { find } from 'lodash'
import { useHotkeys } from '@mantine/hooks'
import { InputModal } from '@src/widget/input_modal'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { useEditorContext } from '../Editor.context'
import { SceneText } from './SceneText'

interface ContinuousBodyProps {
    chapter: Chapter
}

export const ContinuousBody: React.FC<ContinuousBodyProps> = ({ chapter }) => {
    const { activeBook, settings } = useAppContext()
    const {
        activeScene,

        sceneBroker,
        chapterBroker,
        setActiveScene
    } = useEditorContext()

    const paperRefs = useRef<Record<string, HTMLDivElement>>({})

    const [debounceTime] = settings.makeState('debounceTime')

    if (chapter === undefined) {
        throw Error('Data integrity issue, body chapter is not defined')
    }

    const addScene = useCallback(
        (chapterId: Chapter['id']) => {
            new InputModal().arun('Provide a scene name').then((new_name) => {
                if (new_name.length < 3) {
                    ShowError('Error', 'New scene names must be at least 3 characters long')
                } else {
                    if (!activeScene) {
                        ShowError('Critical Error', 'Attempting to split scenes without an activeScene')
                        return
                    }
                    sceneBroker.create(chapterId, new_name, activeScene.order + 1 || -1).then((detail) => {
                        console.log('create returned ', detail)
                    })
                }
            })
        },
        [activeScene, sceneBroker]
    )

    const prevScene = () => {
        if (activeScene && activeScene.order > 0) {
            const prior = find(chapter?.scenes, { order: activeScene.order - 1 })
            prior && setActiveScene(chapter, prior)
        } else if (chapter && chapter.order > 0) {
            const prior_order = chapter.order - 1
            const prior = find(activeBook.chapters, { order: prior_order })
            if (prior) {
                const last_scene = prior.scenes[prior.scenes.length - 1]
                last_scene && setActiveScene(prior, last_scene)
            }
        }
    }
    const nextScene = () => {
        console.log(chapter.scenes)
        if (activeScene && chapter && activeScene.order + 1 < chapter.scenes.length) {
            const next_order = activeScene.order + 1
            const next = find(chapter.scenes || [], { order: next_order })
            next && setActiveScene(chapter, next)
        } else if (chapter.order < activeBook.chapters.length - 1) {
            const next_order = chapter.order + 1
            const next_chapter = find(activeBook.chapters, { order: next_order })
            if (next_chapter) {
                const first_scene = next_chapter.scenes[0]
                first_scene && setActiveScene(next_chapter, first_scene)
            }
        }
    }

    useHotkeys(
        [
            ['ctrl+PageUp', () => prevScene()],
            ['ctrl+PageDown', () => nextScene()]
        ],
        []
    )

    const form = useForm({
        initialValues: {
            title: chapter.title
        },
        validate: {
            title: (value: string | undefined) =>
                value !== undefined && value.length <= 2
                    ? "Chapter title's need to be at least 3 characters long"
                    : undefined
        }
    })

    useDebouncedEffect(
        () => {
            async function updateChapterTitle() {
                if (chapter) {
                    const new_chapter: Chapter = {
                        ...chapter,
                        title: form.values.title || 'Missing chapter'
                    }
                    await chapterBroker.update(new_chapter)
                } else {
                    ShowError('Full STOP!', 'Data integrity issue, activeChapter is not defined')
                }
            }

            if (form.isDirty()) {
                updateChapterTitle().then()
            }
        },
        [form.values],
        { delay: debounceTime || 900, runOnInitialize: false }
    )

    useEffect(() => {
        if (activeScene && paperRefs.current[activeScene.id] !== undefined) {
            paperRefs.current[activeScene.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }
    }, [activeScene, activeScene?.id])

    if (!chapter) {
        return (
            <>
                <Title order={2}>Missing active chapter</Title>
            </>
        )
    }

    return (
        <Stack>
            {/*Chapter title*/}
            <TextInput {...form.getInputProps('title')} />

            {chapter.scenes.map((scene: Scene) => (
                <Paper
                    key={scene.id}
                    shadow='xl'
                    p='xs'
                    withBorder
                    style={{ minHeight: '80vh', marginBottom: '2em' }}
                    ref={(ref: HTMLDivElement) => {
                        if (ref) {
                            paperRefs.current[scene.id] = ref
                        }
                    }}
                >
                    {scene && (
                        <SceneText
                            key={`${scene.id} ${scene.order}`}
                            scene={scene}
                        />
                    )}
                </Paper>
            ))}
            <Center>
                <Button onClick={() => addScene(chapter.id)}>Create a new scene</Button>
            </Center>
        </Stack>
    )
}
