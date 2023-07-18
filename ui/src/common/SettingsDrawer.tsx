import { Checkbox, Drawer, NumberInput, Select, Text, Textarea, TextInput, Title } from '@mantine/core'
import React from 'react'
import { map } from 'lodash'
import { useAppContext } from '@src/App.context'

interface SettingsDrawerProps {
    opened: boolean
    close: () => void
}
export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ opened, close }) => {
    const { activeFont, setActiveFont, fonts } = useAppContext()

    const select_fonts = map([...fonts], (fontName: string) => ({ value: fontName, label: fontName }))
    const example_ipsum =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et' +
        ' dolore magna aliqua. Fermentum iaculis eu non diam phasellus vestibulum lorem. Consequat ac felis ' +
        'donec et odio pellentesque diam volutpat commodo. Mi eget mauris pharetra et. '

    return (
        <Drawer
            opened={opened}
            onClose={close}
            position='right'
            title='Settings'
        >
            <Title order={1}>General settings</Title>
            <Text>Example text</Text>
            <Textarea
                readOnly
                value={example_ipsum}
                minRows={5}
            />
            <Select
                label='Font name'
                searchable
                zIndex={1000}
                data={select_fonts}
                value={activeFont.name}
                onChange={(new_font_name) => {
                    setActiveFont((old_font) => {
                        if (old_font && new_font_name) {
                            // eslint-disable-next-line no-param-reassign
                            old_font.name = new_font_name
                        }
                    })
                }}
            />
            <NumberInput
                label='Font size (in pixels)'
                value={activeFont.size}
                max={45}
                min={10}
                onChange={(new_font_size) => {
                    setActiveFont((old_font) => {
                        if (old_font && new_font_size) {
                            // eslint-disable-next-line no-param-reassign
                            old_font.size = new_font_size
                        }
                    })
                }}
            />
            <NumberInput
                label='Save delay (in milliseconds - 1000 is one second, max 5 seconds)'
                value={800}
                max={5000}
                min={500}
                step={100}
            />
            <TextInput
                label='AI API Key (disabled)'
                disabled
            />
            <Title order={1}>Flow settings</Title>
            <Checkbox label={"Don't ask when splitting a scene"} />
            <Checkbox label={"Don't ask to delete, just delete the scene, when it is empty."} />
        </Drawer>
    )
}
