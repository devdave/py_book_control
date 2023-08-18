import { createStyles, Skeleton, Tabs, Text } from '@mantine/core'
import { type FC, KeyboardEventHandler, useCallback } from 'react'
import { IconId, IconMapPin, IconNote, IconUsers, IconVocabulary } from '@tabler/icons-react'
import { type Scene } from '@src/types'
import { useAppContext } from '@src/App.context'

import { useEditorContext } from '@src/modes/edit/Editor.context'
import { useHotkeys } from '@mantine/hooks'
import { find } from 'lodash'
import { useRotate } from '@src/lib/use-rotate'
import { SceneCharacters } from '@src/modes/edit/common/SceneCharacters'
import { SceneSummaryForm } from '@src/modes/edit/editor_panel/scene_forms/SceneSummaryForm'
import TextSceneForm from './scene_forms/TextSceneForm'

import { SceneContentForm } from './scene_forms/SceneContentForm'

const useStyles = createStyles((theme) => ({
    tabPanel: {
        paddingTop: theme.spacing.xl
    }
}))

export interface ScenePanelProps {
    indexedScene: Scene
}

export const ScenePanel: FC<ScenePanelProps> = ({ indexedScene }) => {
    const { activeBook } = useAppContext()
    const { sceneBroker, activeScene, setActiveScene, activeChapter } = useEditorContext()
    const { classes } = useStyles()

    const {
        data: scene,
        isLoading: sceneIsLoading,
        status: sceneLoadStatus,
        error: sceneLoadError
    } = sceneBroker.fetch(activeBook.id, indexedScene.chapterId, indexedScene.id)

    const [activeTab, { nextOption: nextTab, prevOption: prevTab }] = useRotate([
        'content',
        'summary',
        'notes',
        'location',
        'characters'
    ])
    useHotkeys(
        [
            ['ctrl+ArrowLeft', () => prevTab()],
            ['ctrl+ArrowRight', () => nextTab()]
        ],
        []
    )

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
    }, [activeChapter, activeScene, setActiveScene])

    const handleCtrlKey: KeyboardEventHandler<HTMLTextAreaElement> = (evt) => {
        if (evt.ctrlKey) {
            let action
            switch (evt.key) {
                case 'Tab':
                case 'ArrowRight':
                    action = nextTab
                    break
                case 'ArrowLeft':
                    action = prevTab
                    break
                case 'PageUp':
                    action = goPriorScene
                    break
                case 'PageDown':
                    action = goNextScene
                    break
                default:
                    break
            }
            if (action) {
                console.log('Handling ctrl key')
                evt.preventDefault()
                action()
            }
        }
    }

    if (scene === undefined && sceneIsLoading) {
        return (
            <>
                <h2>Loading scene</h2>
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </>
        )
    }

    if (sceneLoadStatus === 'error') {
        const errorMessage =
            sceneLoadError instanceof Error ? sceneLoadError.message : (sceneLoadError as string)
        console.error('Failed to load: indexedScene', indexedScene, errorMessage)

        return (
            <>
                <h2>There was a problem loading the scene</h2>
                <Text>{errorMessage}</Text>
            </>
        )
    }

    return (
        <>
            <Tabs
                classNames={{ panel: classes.tabPanel }}
                value={activeTab}
                onTabChange={(name) => name && nextTab(name)}
            >
                <Tabs.List>
                    <Tabs.Tab
                        icon={<IconVocabulary size='0.8rem' />}
                        value='content'
                        onClick={() => nextTab('content')}
                    >
                        Content
                    </Tabs.Tab>
                    <Tabs.Tab
                        icon={<IconId size='0.8rem' />}
                        value='summary'
                        onClick={() => nextTab('summary')}
                    >
                        Summary
                    </Tabs.Tab>
                    <Tabs.Tab
                        icon={<IconNote size='0.8rem' />}
                        value='notes'
                        onClick={() => nextTab('notes')}
                    >
                        Notes
                    </Tabs.Tab>
                    <Tabs.Tab
                        icon={<IconMapPin size='0.8rem' />}
                        value='location'
                        onClick={() => nextTab('location')}
                    >
                        Location
                    </Tabs.Tab>
                    <Tabs.Tab
                        icon={<IconUsers size='0.8rem' />}
                        value='characters'
                        onClick={() => nextTab('characters')}
                    >
                        Characters
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value='content'>
                    <SceneContentForm
                        scene={scene}
                        onKeyUp={handleCtrlKey}
                    />
                </Tabs.Panel>
                <Tabs.Panel value='summary'>
                    <SceneSummaryForm
                        scene={scene}
                        onKeyUp={handleCtrlKey}
                    />
                </Tabs.Panel>
                <Tabs.Panel value='notes'>
                    <TextSceneForm
                        scene={scene}
                        onKeyUp={handleCtrlKey}
                        field='notes'
                        label='Notes'
                    />
                </Tabs.Panel>
                <Tabs.Panel value='location'>
                    <TextSceneForm
                        scene={scene}
                        onKeyUp={handleCtrlKey}
                        field='location'
                        label='Location'
                    />
                </Tabs.Panel>
                <Tabs.Panel value='characters'>
                    <SceneCharacters
                        scene={scene}
                        key={scene.characters.length}
                    />
                </Tabs.Panel>
            </Tabs>
        </>
    )
}
