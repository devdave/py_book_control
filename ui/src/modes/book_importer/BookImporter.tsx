import React, { useMemo } from 'react'
import { AppShell, LoadingOverlay, Text, Title } from '@mantine/core'

import { useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@src/App.context'
import { BatchBroker } from '@src/modes/book_importer/lib/BatchBroker'
import { ImporterHeader } from '@src/modes/book_importer/ImporterHeader'
import { BookImporterStepper } from '@src/modes/book_importer/steps/BookImporterStepper'
import { BookImporterContext, ImportContext } from '@src/modes/book_importer/BookImporter.context'
import { ActiveStage, ActiveStages } from '@src/modes/book_importer/lib/active-stage'
import { Process } from '@src/modes/book_importer/process/Process'

export const BookImporter = () => {
    const { api } = useAppContext()
    const queryClient = useQueryClient()

    const batchBroker = BatchBroker({ api, queryClient })
    const activeStage = new ActiveStage()

    const bookContextValue = useMemo<BookImporterContext>(
        () => ({
            activeStage,
            batchBroker
        }),
        [batchBroker]
    )

    const { data: batch, isLoading: batchLoading, status: batchStatus } = batchBroker.fetch()

    if (batchLoading) {
        return (
            <>
                <Title>Starting import wizard</Title>
                <LoadingOverlay visible />
            </>
        )
    }

    if (!batch) {
        return (
            <>
                <Text>Failed to load the batch memory object</Text>
            </>
        )
    }

    const header = <ImporterHeader />

    return (
        <ImportContext.Provider value={bookContextValue}>
            <AppShell header={header}>
                {activeStage.current === ActiveStages.INITIAL && <BookImporterStepper batch={batch} />}
                {activeStage.current === ActiveStages.PROCESS && <Process />}
            </AppShell>
        </ImportContext.Provider>
    )
}
