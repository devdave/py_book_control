import { createContext, useContext } from 'react'
import { AppModes, Book, Font } from '@src/types'
import APIBridge from '@src/lib/remote'
import { Updater } from 'use-immer'

export interface AppContextValue {
    api: APIBridge

    appMode: AppModes
    setAppMode: (mode: AppModes) => void

    activeBook: Book
    setActiveBook: (val: Book) => void

    updateBook: (val: Partial<Book>) => void

    fonts: Set<string>
    setFonts: (val: Set<string>) => void

    activeFont: Font
    setActiveFont: Updater<Font>

    debounceTime: number
}

// @ts-ignore
export const AppContext = createContext<AppContextValue>(null)

export const useAppContext = () => useContext(AppContext)
