import Boundary, { PYWEBVIEWREADY } from '@src/lib/boundary'
import APIBridge from '@src/lib/remote'
import { font_set } from '@src/lib/font_set'
import { ThemeProvider } from '@src/ThemeProvider'
import { Editor } from '@src/modes/edit/Editor'

import { AppContext, AppContextValue } from '@src/App.context'

import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { LoadingOverlay, TabsValue, Text } from '@mantine/core'
import { AppModes, AppSettingValues, type Book, type UID } from '@src/types'

import { Manifest } from '@src/modes/manifest/Manifest'
import { useImmer } from 'use-immer'
import { ApplicationSetting, useSettings } from '@src/lib/use-settings'
import { forEach } from 'lodash'

interface AppWrapperProps {
    value: AppContextValue
    children: ReactNode
    safeToProceed: boolean
}

const AppWrapper: FC<AppWrapperProps> = ({ value, children, safeToProceed }) => (
    <AppContext.Provider value={value}>
        {!safeToProceed && <LoadingOverlay visible />}
        {safeToProceed && (
            <ThemeProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
        )}
    </AppContext.Provider>
)

const App: React.FC = () => {
    const queryClient = useQueryClient()
    const [appMode, setAppMode] = useState(AppModes.MANIFEST)

    const [isReady, setIsReady] = useState(false)
    const [defaultsDone, setDefaultsDone] = useState(false)

    const [activeBook, setActiveBook] = useImmer<Book>({
        chapters: [],
        created_on: '',
        id: '',
        notes: '',
        title: 'NotSet',
        updated_on: '',
        words: 0
    })

    const [fonts, setFonts] = useState<Set<string>>(new Set())

    const boundary = useMemo(() => new Boundary(), [])

    const api = useMemo(() => new APIBridge(boundary), [boundary])

    const directDefaultSetter = (
        name: keyof AppSettingValues,
        val: AppSettingValues[keyof AppSettingValues],
        type: string
    ) => {
        api.setDefaultSetting(name, val, type).then()
    }

    const settingsSetter = useMutation(({ name, value }) => api.setSetting(name, value), {
        onSuccess: (data: undefined, { name, value }: { name: string; value: string }) => {
            console.log(`Updated setting.${name} with ${value}`)
            queryClient.setQueryData(['setting', name], () => value)

            queryClient
                .invalidateQueries({
                    queryKey: ['settings'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })

    const fetchSetting = (name: string) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ['setting', name],
            queryFn: () => api.getSetting(name)
        })

    const bulkDefaultSetter = (changeset: object[]): Promise<any> => api.bulkDefaultSettings(changeset)

    const bulkFetchSettings = (): Promise<ApplicationSetting<AppSettingValues>[]> => api.fetchAllSettings()

    const reconcileSettings = (values: ApplicationSetting<AppSettingValues>[]) => {
        console.log(`Got bulk settings ${JSON.stringify(values)}`)
        forEach(values, (setting, idx) => {
            queryClient.setQueryData(['setting', setting.name], () => setting.value)
        })
    }

    const settings = useSettings<AppSettingValues>({
        bulkFetchSettings,
        bulkDefaultSetter,
        getter: fetchSetting,
        setter: settingsSetter,
        defaultSettings: {
            fontName: 'calibri',
            lineHeight: 150,
            fontSize: 18,
            fontWeight: 400,
            debounceTime: 800,
            dontAskOnSplit: false,
            dontAskOnClear2Delete: false
        }
    })

    const doReady = useCallback(async () => {
        if (!defaultsDone) {
            settings.reconcile(reconcileSettings)
            setDefaultsDone(true)
        }

        if (activeBook.title === 'NotSet') {
            const response = await api.get_current_book()
            if (response) {
                if (response.id !== undefined) {
                    setActiveBook(response as Book)
                    setAppMode(AppModes.EDITOR)
                }
            }
        }

        setIsReady(() => true)
    }, [defaultsDone, activeBook.title, settings, api, setActiveBook])

    const checkFonts = useCallback(() => {
        const fontAvailable = new Set<string>()

        // eslint-disable-next-line no-restricted-syntax
        for (const font of font_set.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font)
            }
        }
        setFonts(fontAvailable)
    }, [])

    useEffect(() => {
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            doReady().then()
        } else {
            window.addEventListener(PYWEBVIEWREADY, doReady, { once: true })
        }
    }, [doReady])

    useEffect(() => {
        document.fonts.ready.then(() => {
            checkFonts()
        })
    }, [checkFonts])

    const _changeBook = useMutation<Book, Error, Book>((book) => api.update_book(book), {
        onSuccess: (updated: Book) => {
            queryClient.invalidateQueries(['book', updated.id, 'index']).then()
            if (updated.id === activeBook.id) {
                setActiveBook((draft) => {
                    draft.title = updated.title
                    draft.notes = updated.notes
                    draft.updated_on = updated.updated_on
                })
            }
        }
    })

    const updateBook = useCallback(
        (book: Partial<Book>) => {
            if (book.id) {
                _changeBook.mutate(book as Book)
            }
        },
        [_changeBook]
    )

    const fetchStrippedBooks = useCallback(
        () =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Book[], Error>({
                queryFn: () => api.list_books(true),
                queryKey: ['books', 'index']
            }),
        [api]
    )

    const fetchStrippedBook = useCallback(
        (book_id: UID) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Book, Error>({
                enabled: book_id !== undefined,
                staleTime: 10000,
                queryFn: () => api.fetch_book_simple(book_id),
                queryKey: ['book', book_id]
            }),
        [api]
    )

    const appContextValue = useMemo<AppContextValue>(
        () => ({
            api,
            settings,
            appMode,
            setAppMode,
            activeBook,
            setActiveBook,
            updateBook,
            fetchStrippedBook,
            fetchStrippedBooks,
            fonts,
            setFonts
        }),
        [
            api,
            settings,
            appMode,
            activeBook,
            setActiveBook,
            updateBook,
            fetchStrippedBook,
            fetchStrippedBooks,
            fonts
        ]
    )

    return (
        <AppWrapper
            value={appContextValue}
            safeToProceed={isReady && defaultsDone}
        >
            <LoadingOverlay visible={!isReady} />
            {useMemo(() => {
                if (!isReady || !defaultsDone) {
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
            }, [appMode, defaultsDone, isReady])}
        </AppWrapper>
    )
}

export default App
