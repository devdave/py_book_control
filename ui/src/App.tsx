import Boundary, { PYWEBVIEWREADY } from '@src/lib/boundary'
import APIBridge from '@src/lib/remote'
import { font_set } from '@src/lib/font_set'
import { ThemeProvider } from '@src/ThemeProvider'
import { Editor } from '@src/modes/edit/Editor'

import { AppContext, AppContextValue } from '@src/App.context'

import { FC, ReactNode, useEffect, useMemo, useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { LoadingOverlay, MantineProvider, Text } from '@mantine/core'
import { AppModes, Book, Font } from '@src/types'
import { Manifest } from '@src/modes/manifest/Manifest'
import { useImmer } from 'use-immer'
//import APIBridge from "./lib/remote";

const queryClient = new QueryClient()

declare global {
    interface window {
        pywebview: any
    }
}

interface AppWrapperProps {
    api: APIBridge
    value: AppContextValue
    activeFont: Font
    children: ReactNode
}

const AppWrapper: FC<AppWrapperProps> = ({ api, value, activeFont, children }) => (
    <ThemeProvider api={api}>
        <QueryClientProvider client={queryClient}>
            <AppContext.Provider value={value}>
                <MantineProvider
                    theme={{
                        globalStyles: () => ({
                            textarea: {
                                fontFamily: `"${activeFont.name}"`,
                                fontSize: `${activeFont.size}px`
                            }
                        }),
                        components: {
                            Textarea: {
                                styles: () => ({
                                    input: {
                                        fontFamily: `"${activeFont.name}"`,
                                        fontSize: `${activeFont.size}px`
                                    }
                                })
                            },
                            TextInput: {
                                styles: () => ({
                                    input: {
                                        fontFamily: `"${activeFont.name}"`,
                                        fontSize: `${activeFont.size}px`
                                    }
                                })
                            }
                        }
                    }}
                >
                    {children}
                </MantineProvider>
            </AppContext.Provider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </ThemeProvider>
)

export default function App() {
    const [appMode, setAppMode] = useState(AppModes.MANIFEST)

    const [isReady, setIsReady] = useState(false)
    const [activeBook, setActiveBook] = useState<Book>({
        chapters: [],
        created_on: '',
        id: '',
        notes: '',
        title: 'NotSet',
        updated_on: '',
        words: 0
    })

    const [fonts, setFonts] = useState<Set<string>>(new Set())
    const [activeFont, setActiveFont] = useImmer<Font>({
        name: 'Calibri',
        size: 16,
        weight: '100'
    })

    const boundary = new Boundary()
    const api = new APIBridge(boundary)

    const doReady = async () => {
        const response = await api.get_current_book()

        console.log('Current book response:', response)

        if (response !== false) {
            if (response.id !== undefined) {
                setActiveBook(response as Book)
                setAppMode(AppModes.EDITOR)
            }
        }

        setIsReady(() => true)
    }

    const checkFonts = () => {
        const fontAvailable = new Set<string>()

        // eslint-disable-next-line no-restricted-syntax
        for (const font of font_set.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font)
            }
        }
        setFonts(fontAvailable)
    }

    useEffect(() => {
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            doReady().then()
        } else {
            window.addEventListener(PYWEBVIEWREADY, doReady, { once: true })
        }
    }, [])

    useEffect(() => {
        document.fonts.ready.then(() => {
            checkFonts()
        })
    }, [])

    const appContextValue = useMemo<AppContextValue>(
        () => ({
            api,
            appMode,
            setAppMode,
            activeBook,
            setActiveBook,
            fonts,
            setFonts,
            activeFont,
            setActiveFont,
            debounceTime: 800
        }),
        [api]
    )

    return (
        <AppWrapper
            api={api}
            value={appContextValue}
            activeFont={activeFont}
        >
            {useMemo(() => {
                if (!isReady) {
                    return <LoadingOverlay visible />
                }

                switch (appMode) {
                    case AppModes.OUTLINE:
                        return <Text>Outline mode</Text>
                    case AppModes.STATS:
                        return <Text>Stats mode</Text>
                    case AppModes.EDITOR:
                        return <Editor />
                    case AppModes.MANIFEST:
                        return <Manifest />
                    default:
                        return <Text>Application error: unexpected mode {appMode}</Text>
                }
            }, [appMode, isReady, activeBook])}
        </AppWrapper>
    )
}
