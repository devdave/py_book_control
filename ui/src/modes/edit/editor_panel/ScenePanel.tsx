import { createStyles, Skeleton, Tabs, Text } from '@mantine/core'
import { type FC, KeyboardEventHandler } from 'react'
import { IconId, IconMapPin, IconNote, IconUsers, IconVocabulary } from '@tabler/icons-react'
import { type Scene, type UID } from '@src/types'
import { useAppContext } from '@src/App.context'

import { CharactersSceneForm } from '@src/modes/edit/common/CharactersSceneForm'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { useHotkeys, useToggle } from '@mantine/hooks'
import TextSceneForm from './scene_forms/TextSceneForm'

import { MainSceneForm } from './scene_forms/MainSceneForm'

const useStyles = createStyles((theme) => ({
    tabPanel: {
        paddingTop: theme.spacing.xl
    }
}))

export interface ScenePanelProps {
    indexedScene: Scene
}

export const ScenePanel: FC<ScenePanelProps> = ({ indexedScene }) => {
    const { api, activeBook } = useAppContext()
    const { fetchScene } = useEditorContext()
    const { classes } = useStyles()

    const {
        data: scene,
        isLoading: sceneIsLoading,
        status: sceneLoadStatus,
        error: sceneLoadError
    } = fetchScene(indexedScene.chapterId as UID, indexedScene.id as UID)

    const [activeTab, nextTab] = useToggle(['content', 'summary', 'notes', 'location', 'characters'])
    useHotkeys([['ctrl+tab', () => nextTab()]])

    if (sceneIsLoading) {
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

    const handleCtrlTab: KeyboardEventHandler<HTMLTextAreaElement> = (evt) => {
        if (evt.ctrlKey && evt.key === 'Tab') {
            evt.preventDefault()
            nextTab()
        }
    }
    console.log('ScenePanel', scene)

    return (
        <Tabs
            classNames={{ panel: classes.tabPanel }}
            value={activeTab}
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
                <MainSceneForm
                    scene={scene}
                    nextTab={nextTab}
                />
            </Tabs.Panel>
            <Tabs.Panel value='summary'>
                <TextSceneForm
                    scene={scene}
                    nextTab={nextTab}
                    field='summary'
                    label='Summary'
                />
            </Tabs.Panel>
            <Tabs.Panel value='notes'>
                <TextSceneForm
                    scene={scene}
                    nextTab={nextTab}
                    field='notes'
                    label='Notes'
                />
            </Tabs.Panel>
            <Tabs.Panel value='location'>
                <TextSceneForm
                    scene={scene}
                    nextTab={nextTab}
                    field='location'
                    label='Location'
                />
            </Tabs.Panel>
            <Tabs.Panel value='characters'>
                <CharactersSceneForm
                    scene={scene}
                    nextTab={nextTab}
                    key={scene.characters.length}
                />
            </Tabs.Panel>
        </Tabs>
    )
}
