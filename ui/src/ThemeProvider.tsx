import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks'
import { ReactNode } from 'react'
import { ModalsProvider } from '@mantine/modals'
import { useAppContext } from '@src/App.context'

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { settings } = useAppContext()
    const preferredColorScheme = useColorScheme()
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'mantine-color-scheme',
        defaultValue: preferredColorScheme,
        getInitialValueInEffect: true
    })
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

    useHotkeys([['mod+J', () => toggleColorScheme()]])

    const [fontName] = settings.makeState('fontName')
    const [fontSize] = settings.makeState('fontSize')
    const [fontWeight] = settings.makeState('fontWeight')
    const [lineHeight] = settings.makeState('lineHeight')

    const safeFont = fontName || 'Calibre'

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
                            fontFamily: `"${safeFont}"`,
                            fontSize: `${fontSize}px`,
                            fontWeight,
                            lineHeight: `${lineHeight}%`,
                            textAlign: 'justify',
                            whiteSpace: 'pre-wrap'
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
                                    lineHeight: `${lineHeight}%`,
                                    textAlign: 'justify',
                                    whiteSpace: 'pre-wrap',
                                    padding: '14px 30px'
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
