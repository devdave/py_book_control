import { BatchBrokerReturns } from '@src/modes/book_importer/lib/BatchBroker'

export interface BookImporterContext {
    batchBroker: BatchBrokerReturns
}
