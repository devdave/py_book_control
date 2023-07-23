import { Button, Center, Paper, TextInput, Text, Title, Stack } from '@mantine/core'
import { useEffect, useRef } from 'react'
import { useForm } from '@mantine/form'
import { useAppContext } from '@src/App.context'
import { Chapter, type Scene } from '@src/types'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { find } from 'lodash'
import { useHotkeys } from '@mantine/hooks'
import { useEditorContext } from '../Editor.context'
import { SceneText } from './SceneText'

export const ContinuousBody: React.FC = () => {
    const { activeBook, settings } = useAppContext()
    const {
        activeChapter,
        activeScene,

        sceneBroker,
        chapterBroker,
        setActiveScene
    } = useEditorContext()
    const paperRefs = useRef<Record<string, HTMLDivElement>>({})

    const [debounceTime] = settings.makeState('debounceTime')

    if (activeChapter === undefined) {
        throw Error('Data integrity issue, activechapter is not defined')
    }

    const prevScene = () => {
        if (activeScene && activeScene.order > 0) {
            const prior = find(activeChapter?.scenes, { order: activeScene.order - 1 })
            prior && setActiveScene(activeChapter, prior)
        } else if (activeChapter && activeChapter.order > 0) {
            const prior_order = activeChapter.order - 1
            const prior = find(activeBook.chapters, { order: prior_order })
            if (prior) {
                const last_scene = prior.scenes[prior.scenes.length - 1]
                last_scene && setActiveScene(prior, last_scene)
            }
        }
    }
    const nextScene = () => {
        if (activeScene && activeScene.order + 1 < activeChapter!.scenes.length) {
            const next_order = activeScene.order + 1
            const next = find(activeChapter!.scenes, { order: next_order })
            next && setActiveScene(activeChapter, next)
        } else if (activeChapter.order < activeBook.chapters.length - 1) {
            const next_order = activeChapter.order + 1
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

    const { data: chapter, isLoading: chapterIsLoading } = chapterBroker.fetch(
        activeBook.id,
        activeChapter.id
    )

    const form = useForm({
        initialValues: {
            title: activeChapter?.title
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
                if (activeChapter) {
                    const new_chapter: Chapter = {
                        ...(activeChapter as Chapter),
                        title: form.values.title || 'Missing chapter'
                    }
                    chapterBroker.update(new_chapter)
                } else {
                    alert('Full stop! Data integrity issue.  activeChapter is not defined.')
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
    }, [activeScene?.id])

    if (!activeChapter) {
        return (
            <>
                <Title order={2}>Missing active chapter</Title>
            </>
        )
    }

    if (chapterIsLoading) {
        return (
            <>
                <Text>Loading chapter...</Text>
            </>
        )
    }

    if (!chapter) {
        return (
            <>
                <Text>There was a problem loading the requested chapter.</Text>
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
                    style={{ height: '80vh', marginBottom: '2em' }}
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
            {activeChapter?.scenes.length === 0 && (
                <Center>
                    <Button onClick={() => sceneBroker.add(activeChapter.id)}>Create a scene</Button>
                </Center>
            )}
        </Stack>
    )
}
