import { createContext, useContext } from 'react'

export interface WebRootContextValues {
    crumbs: React.ReactElement[]
}

export const WebRootContext = createContext<WebRootContextValues>({crumbs:[]})

export const useWebRootContext = () => useContext(WebRootContext)
