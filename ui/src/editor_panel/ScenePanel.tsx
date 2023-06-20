import { Center, createStyles, Tabs } from '@mantine/core'
import { type FC } from 'react'
import { IconId, IconMapPin, IconNote, IconUsers, IconVocabulary } from '@tabler/icons-react'
import TextSceneForm from './scene_forms/TextSceneForm';

import { MainSceneForm } from './scene_forms/MainSceneForm'

import { type Scene } from '../types'

const useStyles = createStyles((theme) => ({
  tabPanel: {
    paddingTop: theme.spacing.xl
  }
}))

export interface ScenePanelProps {
  scene: Scene
}

export const ScenePanel: FC<ScenePanelProps> = ({ scene }) => {
  const { classes } = useStyles()

  return (
    <Tabs
      classNames={{ panel: classes.tabPanel }}
      defaultValue='content'
    >
      <Tabs.List>
        <Tabs.Tab
          icon={<IconVocabulary size='0.8rem' />}
          value='content'
        >
          Content
        </Tabs.Tab>
        <Tabs.Tab
          icon={<IconId size='0.8rem' />}
          value='summary'
        >
          Summary
        </Tabs.Tab>
        <Tabs.Tab
          icon={<IconNote size='0.8rem' />}
          value='notes'
        >
          Notes
        </Tabs.Tab>
        <Tabs.Tab
          icon={<IconMapPin size='0.8rem' />}
          value='location'
        >
          Locations
        </Tabs.Tab>
        <Tabs.Tab
          icon={<IconUsers size='0.8rem' />}
          value='characters'
        >
          Characters
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value='content'>
        <MainSceneForm scene={scene} />
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
