import { ColorSchemeProvider, ColorScheme, MantineProvider } from '@mantine/core'
import { useHotkeys, useLocalStorage, useColorScheme } from '@mantine/hooks'
import { ReactNode } from 'react'
import { ModalsProvider } from '@mantine/modals'
import APIBridge from '@src/lib/remote'

interface ThemeProviderProps {
    api: APIBridge
    children: ReactNode
}

export function ThemeProvider({ api, children }: ThemeProviderProps) {
    const preferredColorScheme = useColorScheme()
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'mantine-color-scheme',
        defaultValue: preferredColorScheme,
        getInitialValueInEffect: true
    })
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

    useHotkeys([['mod+J', () => toggleColorScheme()]])

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
        >
            <MantineProvider
                theme={{
                    colorScheme
                }}
                withGlobalStyles
                withNormalizeCSS
            >
                <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}
