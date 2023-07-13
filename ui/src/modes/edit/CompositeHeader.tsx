import {
    ActionIcon,
    createStyles,
    Drawer,
    Group,
    Header,
    NumberInput,
    Select,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    useMantineColorScheme
} from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { AppModes } from '@src/types'
import { IconArrowBack, IconMoonStars, IconSettings, IconSun } from '@tabler/icons-react'
import { ToggleInput } from '@src/widget/ToggleInput'

import React, { useCallback } from 'react'
import { map } from 'lodash'
import { useDisclosure } from '@mantine/hooks'

const useStyles = createStyles((styles_theme) => ({
    header_main: {
        colorScheme: styles_theme.colorScheme,
        backgroundColor: styles_theme.colorScheme === 'light' ? 'white' : 'black'
    }
}))

export const CompositeHeader: React.FC = () => {
    const { activeBook, updateBook, setAppMode, activeFont, setActiveFont, fonts } = useAppContext()

    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const select_fonts = map([...fonts], (fontName: string) => ({ value: fontName, label: fontName }))

    const [opened, { open, close }] = useDisclosure(false)

    const example_ipsum =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et' +
        ' dolore magna aliqua. Fermentum iaculis eu non diam phasellus vestibulum lorem. Consequat ac felis ' +
        'donec et odio pellentesque diam volutpat commodo. Mi eget mauris pharetra et. '

    return (
        <Header
            height={110}
            zIndex={150}
        >
            <Drawer
                opened={opened}
                onClose={close}
                position='right'
                title='Settings'
            >
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
            </Drawer>
            <Stack spacing='xs'>
                <Group
                    align='center'
                    position='apart'
                    h={60}
                    px='xs'
                >
                    <Group>
                        <ActionIcon
                            title='Go back to book list'
                            onClick={() => {
                                setAppMode(AppModes.MANIFEST)
                            }}
                        >
                            <IconArrowBack />
                        </ActionIcon>
                        <ToggleInput
                            title='Double click to edit'
                            value={activeBook.title}
                            onChange={(newTitle) => updateBook({ id: activeBook.id, title: newTitle })}
                        />
                    </Group>

                    <Group>
                        <ActionIcon onClick={open}>
                            <IconSettings />
                        </ActionIcon>
                        <Switch
                            checked={colorScheme === 'dark'}
                            onChange={onToggleColorScheme}
                            size='lg'
                            onLabel={
                                <IconMoonStars
                                    color={theme.white}
                                    size='1.25rem'
                                    stroke={1.5}
                                />
                            }
                            offLabel={
                                <IconSun
                                    color={theme.colors.gray[6]}
                                    size='1.25rem'
                                    stroke={1.5}
                                />
                            }
                        />
                    </Group>
                </Group>
            </Stack>
        </Header>
    )
}
