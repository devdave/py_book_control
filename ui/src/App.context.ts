import { createContext, useContext } from 'react'
import { AppModes, Book, Font, UID } from '@src/types'
import APIBridge from '@src/lib/remote'
import { Updater } from 'use-immer'
import { UseQueryResult } from '@tanstack/react-query'

export interface AppContextValue {
    api: APIBridge

    appMode: AppModes
    setAppMode: (mode: AppModes) => void

    activeBook: Book
    setActiveBook: (val: Book) => void

    updateBook: (val: Partial<Book>) => void
    fetchStrippedBook: (book_id: UID) => UseQueryResult<Book, Error>
    fetchStrippedBooks: () => UseQueryResult<Book[], Error>

    fonts: Set<string>
    setFonts: (val: Set<string>) => void

    activeFont: Font
    setActiveFont: Updater<Font>

    debounceTime: number
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
