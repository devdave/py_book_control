import { Checkbox, Drawer, NumberInput, Select, Text, Textarea, TextInput, Title } from '@mantine/core'
import React from 'react'
import { map } from 'lodash'
import { useAppContext } from '@src/App.context'

interface SettingsDrawerProps {
    opened: boolean
    close: () => void
}
export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ opened, close }) => {
    const { fonts, settings } = useAppContext()

    const select_fonts = map([...fonts], (fontName: string) => ({ value: fontName, label: fontName }))
    const example_ipsum =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et' +
        ' dolore magna aliqua. Fermentum iaculis eu non diam phasellus vestibulum lorem. Consequat ac felis ' +
        'donec et odio pellentesque diam volutpat commodo. Mi eget mauris pharetra et. '

    const [fontName, fontNameIsloading, setFontName] = settings.makeState('fontName')
    const [fontSize, fontSizeIsLoading, setFontSize] = settings.makeState('fontSize')
    const [fontWeight, fontWeightIsLoading, setFontWeight] = settings.makeState('fontWeight')
    const [lineHeight, lineHeightIsLoading, setLineHeight] = settings.makeState('lineHeight')
    const [debounceDelay, debounceDelayIsLoading, setDebounceDelay] = settings.makeState('debounceTime')
    const [dontAskSplit, dontAskSplitIsLoading, setDontAskSplit] = settings.makeState('dontAskOnSplit')
    const [dontAskClear, dontAskClearIsLoading, setDontAskClear] = settings.makeState('dontAskOnClear2Delete')

    console.log('SD', dontAskSplit, dontAskClear)

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
                value={fontName}
                onChange={(new_font_name) => {
                    setFontName(new_font_name as string)
                }}
            />
            <NumberInput
                label='Font size (in pixels)'
                value={fontSize}
                max={45}
                min={10}
                onChange={(new_font_size) => {
                    setFontSize(new_font_size as number)
                }}
            />
            <NumberInput
                label='Font weight'
                value={fontWeight}
                max={1000}
                min={100}
                step={100}
                onChange={(newWeight) => {
                    setFontWeight(newWeight as number)
                }}
            />

            <NumberInput
                label='Line height (in %)'
                value={lineHeight}
                onChange={(val) => {
                    setLineHeight(val as number)
                }}
                max={300}
                min={80}
                step={10}
            />
            <TextInput
                label='AI API Key (disabled)'
                disabled
            />
            <Title order={1}>App behavior</Title>
            <NumberInput
                label='Save delay (in milliseconds - 1000 is one second, max 5 seconds)'
                value={debounceDelay}
                onChange={(val) => setDebounceDelay(val as number)}
                max={5000}
                min={500}
                step={100}
            />
            <Title order={1}>Flow settings</Title>
            <Checkbox
                label={"Don't ask when splitting a scene"}
                checked={dontAskSplit}
                onChange={() => setDontAskSplit(!dontAskSplit)}
            />
            <Checkbox
                label={"Don't ask to delete when a scene is empty."}
                checked={dontAskClear}
                onChange={() => setDontAskClear(!dontAskClear)}
            />
        </Drawer>
    )
}
