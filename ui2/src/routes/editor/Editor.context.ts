import { createContext, useContext } from 'react'

import {Book} from "@src/types.ts"

export interface EditorContextProps {
    book?: Book
}

export const EditorContext = createContext<EditorContextProps>({} as EditorContextProps)

export const useEditorContext = () => useContext(EditorContext)



