import Boundary, { PYWEBVIEWREADY } from '@src/lib/boundary'
import APIBridge from '@src/lib/remote'
import { font_set } from '@src/lib/font_set'
import { ThemeProvider } from '@src/ThemeProvider'
import { Editor } from '@src/modes/edit/Editor'

import { AppContext, AppContextValue } from '@src/App.context'

import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { LoadingOverlay, Text } from '@mantine/core'
import { AppModes, AppSettingName, Book, Font, UID } from '@src/types'
import { Manifest } from '@src/modes/manifest/Manifest'
import { useImmer } from 'use-immer'
import { AppSettings } from '@src/lib/AppSettings'

interface AppWrapperProps {
    value: AppContextValue
    children: ReactNode
}

const AppWrapper: FC<AppWrapperProps> = ({ value, children }) => (
    <AppContext.Provider value={value}>
        <ThemeProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
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
    const [activeFont, setActiveFont] = useImmer<Font>({
        name: 'Calibri',
        size: 16,
        weight: '100',
        height: '120%'
    })

    const boundary = useMemo(() => new Boundary(), [])

    const api = useMemo(() => new APIBridge(boundary), [boundary])

    const defaultSetter = useMutation<any, Error, any, any>(
        ['setting', 'default'],
        ([name, val, type]: [AppSettingName, string | number, string]) =>
            api.setDefaultSetting(name, val, type)
    )

    const settingSetter = useMutation<any, Error, any, any>({
        mutationKey: ['setting', 'setter'],
        mutationFn: ([name, val]: [AppSettingName, string | number]) => api.setSetting(name, val),
        onSuccess: (data: undefined, [name, val]: [AppSettingName, string | number, string]) => {
            queryClient.setQueryData(['setting', name], () => val)

            queryClient.invalidateQueries({
                queryKey: ['settings'],
                exact: true,
                refetchType: 'active'
            })
        }
    })

    const appSettings = useMemo(() => new AppSettings<AppSettingName>(api, queryClient), [api])

    const doReady = useCallback(async () => {
        if (!defaultsDone) {
            appSettings.assignDefaultSetter = defaultSetter
            appSettings.assignSetter = settingSetter

            appSettings.addState<string>(AppSettingName.fontName, 'calibri')

            appSettings.addState<number>(AppSettingName.fontSize, 16)

            appSettings.addState<number>(AppSettingName.fontWeight, 400)

            appSettings.addState<number>(AppSettingName.lineHeight, 120)

            appSettings.addState<number>(AppSettingName.debounceTime, 800)

            appSettings.addState<boolean>(AppSettingName.dontAskOnSplit, false)

            appSettings.addState<boolean>(AppSettingName.dontAskOnClear2Delete, false)
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
    }, [api, appSettings, setActiveBook])

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
            appSettings,
            appMode,
            setAppMode,
            activeBook,
            setActiveBook,
            updateBook,
            fetchStrippedBook,
            fetchStrippedBooks,
            fonts,
            setFonts,
            activeFont,
            setActiveFont,
            debounceTime: 800
        }),
        [
            api,
            appSettings,
            appMode,
            activeBook,
            setActiveBook,
            updateBook,
            fetchStrippedBook,
            fetchStrippedBooks,
            fonts,
            activeFont,
            setActiveFont
        ]
    )

    return (
        <AppWrapper value={appContextValue}>
            <LoadingOverlay visible={!isReady} />
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
            }, [appMode, isReady])}
        </AppWrapper>
    )
}

export default App
