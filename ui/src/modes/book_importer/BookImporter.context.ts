import { BatchBrokerReturns } from '@src/modes/book_importer/lib/BatchBroker'
import { createContext, useContext } from 'react'
import { ActiveStage } from '@src/modes/book_importer/lib/active-stage'

export interface BookImporterContext {
    activeStage: ActiveStage
    batchBroker: BatchBrokerReturns
}

export const ImportContext = createContext<BookImporterContext>({} as BookImporterContext)

export const useImportContext = () => useContext(ImportContext)
