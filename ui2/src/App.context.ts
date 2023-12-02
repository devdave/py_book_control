import { createContext, useContext } from 'react'
import { AppSettingValues } from '@src/types'
import APIBridge from '@src/lib/remote'

import { SettingsManagerReturn } from '@src/lib/use-settings'
import { SceneStatusBrokerFunctions } from '@src/brokers/SceneStatusBroker'
import { BookBrokerReturnFunctions } from '@src/brokers/BookBroker'
import { ChapterBrokerFunctions } from "@src/brokers/ChapterBroker.ts";
import { Switchboard } from '@src/lib/switchboard'
import { ChatBrokerFunctions } from '@src/brokers/ChatBroker'
import {CharacterBrokerFunctions} from "@src/brokers/CharacterBroker.ts";

export interface AppContextValue {
    api: APIBridge
    settings: SettingsManagerReturn<AppSettingValues>
    switchBoard: Switchboard
    fonts: Set<string>

    bookBroker: BookBrokerReturnFunctions
    chapterBroker: ChapterBrokerFunctions
    characterBroker: CharacterBrokerFunctions
    sceneStatusBroker: SceneStatusBrokerFunctions
    chatBroker: ChatBrokerFunctions
    viewMode: string,
    setViewMode: (mode:string)=>void
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
