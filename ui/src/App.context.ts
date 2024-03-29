import { createContext, useContext } from 'react'
import { AppModes, AppSettingValues, Book, UID } from '@src/types'
import APIBridge from '@src/lib/remote'
import { UseQueryResult } from '@tanstack/react-query'
import { SettingsManagerReturn } from '@src/lib/use-settings'
import { SceneStatusBrokerFunctions } from '@src/brokers/SceneStatusBroker'
import { BookBrokerReturnFunctions } from '@src/brokers/BookBroker'
import { Switchboard } from '@src/lib/switchboard'
import { ChatBrokerFunctions } from '@src/brokers/ChatBroker'

export interface AppContextValue {
    api: APIBridge
    settings: SettingsManagerReturn<AppSettingValues>
    switchBoard: Switchboard

    appMode: AppModes
    setAppMode: (mode: AppModes) => void

    activeBook: Book
    setActiveBook: (val: Book) => void

    bookBroker: BookBrokerReturnFunctions

    fonts: Set<string>
    setFonts: (val: Set<string>) => void

    sceneStatusBroker: SceneStatusBrokerFunctions
    chatBroker: ChatBrokerFunctions
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
