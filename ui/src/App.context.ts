import { createContext, useContext } from 'react'
import { AppModes, AppSettingValues, Book, UID } from '@src/types'
import APIBridge from '@src/lib/remote'
import { UseQueryResult } from '@tanstack/react-query'
import { SettingsManagerReturn } from '@src/lib/use-settings'

export interface AppContextValue {
    api: APIBridge
    settings: SettingsManagerReturn<AppSettingValues>

    appMode: AppModes
    setAppMode: (mode: AppModes) => void

    activeBook: Book
    setActiveBook: (val: Book) => void

    updateBook: (val: Partial<Book>) => void
    fetchStrippedBook: (book_id: UID) => UseQueryResult<Book, Error>
    fetchStrippedBooks: () => UseQueryResult<Book[], Error>

    fonts: Set<string>
    setFonts: (val: Set<string>) => void
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
