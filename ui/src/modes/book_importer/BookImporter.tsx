import React, { useState } from 'react'
import { AppShell, LoadingOverlay, Text, Title } from '@mantine/core'

import { useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@src/App.context'
import { BatchBroker } from '@src/modes/book_importer/lib/BatchBroker'
import { ImporterHeader } from '@src/modes/book_importer/ImporterHeader'
import { BookImporterStepper } from '@src/modes/book_importer/BookImporterStepper'

export const BookImporter = () => {
    const { api } = useAppContext()
    const queryClient = useQueryClient()

    const batchBroker = BatchBroker({ api, queryClient })

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
        <AppShell header={header}>
            <BookImporterStepper batch={batch} />
        </AppShell>
    )
}
