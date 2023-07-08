import {Center, createStyles, Skeleton, Tabs} from '@mantine/core'
import {type FC, useEffect, useState} from 'react'
import {IconId, IconMapPin, IconNote, IconUsers, IconVocabulary} from '@tabler/icons-react'
import TextSceneForm from './scene_forms/TextSceneForm';

import {MainSceneForm} from './scene_forms/MainSceneForm'

import {type Scene} from "@src/types";
import {useEditorContext} from "../Editor.context";
import {useQuery} from "@tanstack/react-query";

const useStyles = createStyles((theme) => ({
    tabPanel: {
        paddingTop: theme.spacing.xl
    }
}))

export interface ScenePanelProps {
    indexedScene: Scene
}

export const ScenePanel: FC<ScenePanelProps> = ({indexedScene}) => {
    const {api, activeBook } = useEditorContext();
    const {classes} = useStyles()
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [freshScene, setFreshScene] = useState<Scene | undefined>(undefined);

    const {data:scene, isLoading:sceneIsLoading} = useQuery({
        queryFn: () => api.fetch_scene(indexedScene.id),
        queryKey: ['book', activeBook.id, 'chapter', indexedScene.chapterId, 'scene', indexedScene.id]
    })

    if (sceneIsLoading) {
        return (
            <>
                <h2>Loading scene</h2>
                <Skeleton/>
                <Skeleton/>
                <Skeleton/>
            </>
        )
    }


    return (
        <Tabs
            classNames={{panel: classes.tabPanel}}
            defaultValue='content'
        >
            <Tabs.List>
                <Tabs.Tab
                    icon={<IconVocabulary size='0.8rem'/>}
                    value='content'
                >
                    Content
                </Tabs.Tab>
                <Tabs.Tab
                    icon={<IconId size='0.8rem'/>}
                    value='summary'
                >
                    Summary
                </Tabs.Tab>
                <Tabs.Tab
                    icon={<IconNote size='0.8rem'/>}
                    value='notes'
                >
                    Notes
                </Tabs.Tab>
                <Tabs.Tab
                    icon={<IconMapPin size='0.8rem'/>}
                    value='location'
                >
                    Locations
                </Tabs.Tab>
                <Tabs.Tab
                    icon={<IconUsers size='0.8rem'/>}
                    value='characters'
                >
                    Characters
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value='content'>
                <MainSceneForm scene={scene}/>
            </Tabs.Panel>
            <Tabs.Panel value='summary'>
                <TextSceneForm scene={scene} field="summary" label="Summary"/>
            </Tabs.Panel>
            <Tabs.Panel value='notes'>
                <TextSceneForm scene={scene} field="notes" label="Notes"/>
            </Tabs.Panel>
            <Tabs.Panel value='location'>
                <TextSceneForm scene={scene} field="location" label="Location"/>
            </Tabs.Panel>
            <Tabs.Panel value='characters'>
                <TextSceneForm scene={scene} field={"characters"} label={"Characters"}/>
            </Tabs.Panel>
        </Tabs>
    )
}
