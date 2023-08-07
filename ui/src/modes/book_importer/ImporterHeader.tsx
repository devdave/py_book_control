import { ActionIcon, createStyles, Group, Header, Switch, Title, useMantineColorScheme } from '@mantine/core'
import { IconArrowBack, IconMoonStars, IconSun } from '@tabler/icons-react'
import React, { useCallback } from 'react'
import { useAppContext } from '@src/App.context'
import { AppModes } from '@src/types'

const useStyles = createStyles((styles_theme) => ({
    header_main: {
        colorScheme: styles_theme.colorScheme,
        backgroundColor: styles_theme.colorScheme === 'light' ? 'white' : 'black'
    }
}))

export const ImporterHeader: React.FC = () => {
    const { setAppMode } = useAppContext()
    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const handleGoBack = () => {
        setAppMode(AppModes.MANIFEST)
    }

    return (
        <Header height='6em'>
            <Group position='apart'>
                <Group>
                    <ActionIcon onClick={handleGoBack}>
                        <IconArrowBack />
                    </ActionIcon>
                    <Title>Book importer</Title>
                </Group>

                <Group>
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
        </Header>
    )
}
