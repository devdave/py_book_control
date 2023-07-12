import { ColorSchemeProvider, ColorScheme, MantineProvider } from '@mantine/core'
import { useHotkeys, useLocalStorage, useColorScheme } from '@mantine/hooks'
import { ReactNode } from 'react'
import { ModalsProvider } from '@mantine/modals'
import APIBridge from '@src/lib/remote'
import { useAppContext } from '@src/App.context'

interface ThemeProviderProps {
    api: APIBridge
    children: ReactNode
}

export function ThemeProvider({ api, children }: ThemeProviderProps) {
    const { activeFont } = useAppContext()
    const preferredColorScheme = useColorScheme()
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'mantine-color-scheme',
        defaultValue: preferredColorScheme,
        getInitialValueInEffect: true
    })
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

    useHotkeys([['mod+J', () => toggleColorScheme()]])

    console.log(colorScheme)

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
        >
            <MantineProvider
                theme={{
                    colorScheme
                    // globalStyles: () => ({
                    //     textarea: {
                    //         fontFamily: `"${activeFont.name}"`,
                    //         fontSize: `${activeFont.size}px`
                    //     }
                    // }),
                    // components: {
                    //     Textarea: {
                    //         styles: () => ({
                    //             input: {
                    //                 fontFamily: `"${activeFont.name}"`,
                    //                 fontSize: `${activeFont.size}px`
                    //             }
                    //         })
                    //     },
                    //     TextInput: {
                    //         styles: () => ({
                    //             input: {
                    //                 fontFamily: `"${activeFont.name}"`,
                    //                 fontSize: `${activeFont.size}px`
                    //             }
                    //         })
                    //     }
                    // }
                }}
                // {
                //     colorScheme
                // }}
                withGlobalStyles
                withNormalizeCSS
            >
                <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}
