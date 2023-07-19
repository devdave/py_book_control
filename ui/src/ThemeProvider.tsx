import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks'
import { ReactNode } from 'react'
import { ModalsProvider } from '@mantine/modals'
import APIBridge from '@src/lib/remote'
import { useAppContext } from '@src/App.context'
import { AppSettingName } from '@src/types'

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { appSettings } = useAppContext()
    const preferredColorScheme = useColorScheme()
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'mantine-color-scheme',
        defaultValue: preferredColorScheme,
        getInitialValueInEffect: true
    })
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

    useHotkeys([['mod+J', () => toggleColorScheme()]])

    const { data: fontName } = appSettings.get(AppSettingName.fontName)
    const { data: fontSize } = appSettings.get(AppSettingName.fontSize)
    const { data: fontWeight } = appSettings.get(AppSettingName.fontWeight)
    const { data: lineHeight } = appSettings.get(AppSettingName.lineHeight)

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
        >
            <MantineProvider
                theme={{
                    colorScheme,
                    globalStyles: (theme) => ({
                        textarea: {
                            fontFamily: `"${fontName}"`,
                            fontSize: `${fontSize}px`,
                            fontWeight,
                            lineHeight: `${lineHeight}%`
                        },
                        colorScheme: theme.colorScheme,
                        backgroundColor: theme.colorScheme === 'light' ? 'white' : 'black'
                    }),
                    components: {
                        Textarea: {
                            styles: (theme) => ({
                                root: {
                                    colorScheme: theme.colorScheme
                                },
                                input: {
                                    fontFamily: `"${fontName}"`,
                                    fontSize: `${fontSize}px`,
                                    fontWeight,
                                    lineHeight: `${lineHeight}%`
                                }
                            })
                        },
                        TextInput: {
                            styles: () => ({
                                input: {
                                    fontFamily: `"${fontName}"`,
                                    fontSize: `${fontSize}px`,
                                    fontWeight
                                }
                            })
                        }
                    }
                }}
                withGlobalStyles
                withNormalizeCSS
            >
                <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}
