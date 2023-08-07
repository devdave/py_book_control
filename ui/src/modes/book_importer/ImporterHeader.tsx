import { createStyles, Group, Header, Switch, Title, useMantineColorScheme } from '@mantine/core'
import { IconMoonStars, IconSun } from '@tabler/icons-react'
import React, { useCallback } from 'react'

const useStyles = createStyles((styles_theme) => ({
    header_main: {
        colorScheme: styles_theme.colorScheme,
        backgroundColor: styles_theme.colorScheme === 'light' ? 'white' : 'black'
    }
}))

export const ImporterHeader: React.FC = () => {
    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    return (
        <Header height='6em'>
            <Group position='apart'>
                <Title>Book importer</Title>
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
