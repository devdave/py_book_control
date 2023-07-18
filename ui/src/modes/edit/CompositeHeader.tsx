import {
    ActionIcon,
    Checkbox,
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
    Title,
    useMantineColorScheme
} from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { AppModes } from '@src/types'
import { IconArrowBack, IconMoonStars, IconSettings, IconSun } from '@tabler/icons-react'
import { ToggleInput } from '@src/widget/ToggleInput'

import React, { useCallback } from 'react'

import { useDisclosure } from '@mantine/hooks'
import { SettingsDrawer } from '@src/common/SettingsDrawer'

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

    const [opened, { open, close }] = useDisclosure(false)

    return (
        <Header
            height={110}
            zIndex={150}
        >
            <SettingsDrawer
                opened={opened}
                close={close}
            />
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
