import {
    ActionIcon,
    createStyles,
    Group,
    Header,
    NumberInput,
    Select,
    Stack,
    Switch,
    Text,
    useMantineColorScheme
} from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { AppModes, Font } from '@src/types'
import { IconArrowBack, IconMoonStars, IconSun } from '@tabler/icons-react'
import { ToggleInput } from '@src/widget/ToggleInput'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import React, { useCallback } from 'react'
import { map } from 'lodash'
import './fix_select.css'

const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    },
    aboveall: {
        zIndex: 500
    }
}))

export const CompositeHeader: React.FC = () => {
    const { activeBook, setAppMode, activeFont, setActiveFont, fonts } = useAppContext()
    const { changeBookTitle } = useEditorContext()
    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()
    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const select_fonts = map([...fonts], (fontName: string) => ({ value: fontName, label: fontName }))

    return (
        <Header
            height={120}
            zIndex={150}
        >
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
                            onChange={(newVal) => changeBookTitle.mutate(newVal)}
                        />
                    </Group>

                    {/*<Title order={1}>{bookTitle}</Title>*/}
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
                <Group>
                    <Text>App font</Text>
                    <Select
                        searchable
                        nothingFound='Font not available'
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
                        zIndex={1000}
                        value={activeFont.size}
                        max={24}
                        min={6}
                        onChange={(new_font_size) => {
                            setActiveFont((old_font) => {
                                if (old_font && new_font_size) {
                                    // eslint-disable-next-line no-param-reassign
                                    old_font.size = new_font_size
                                }
                            })
                        }}
                    />
                </Group>
            </Stack>
        </Header>
    )
}
