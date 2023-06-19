import { Center, createStyles, Tabs } from '@mantine/core'
import { type FC } from 'react'
import { IconId, IconMapPin, IconNote, IconUsers, IconVocabulary } from '@tabler/icons-react'

import { SceneForm } from './SceneForm'
import { type Scene } from './types'

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
          value='description'
        >
          Description
        </Tabs.Tab>
        <Tabs.Tab
          icon={<IconNote size='0.8rem' />}
          value='notes'
        >
          Notes
        </Tabs.Tab>
        <Tabs.Tab
          icon={<IconMapPin size='0.8rem' />}
          value='locations'
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
        <SceneForm scene={scene} />
      </Tabs.Panel>
      <Tabs.Panel value='description'>
        <Center h={200}>Description Goes Here</Center>
      </Tabs.Panel>
      <Tabs.Panel value='notes'>
        <Center h={200}>Notes Go Here</Center>
      </Tabs.Panel>
      <Tabs.Panel value='locations'>
        <Center h={200}>Locations Go Here</Center>
      </Tabs.Panel>
      <Tabs.Panel value='characters'>
        <Center h={200}>Characters Go Here</Center>
      </Tabs.Panel>
    </Tabs>
  )
}
