import { useAppContext } from '@src/App.context'
import { Box, Button, Group, LoadingOverlay, Skeleton, Text, Title } from '@mantine/core'
import React, { useEffect, useMemo, useState } from 'react'
import { DocumentFile, ImportedBook } from '@src/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table'
import { BatchSettings } from '@src/modes/book_importer/types'
import { BatchBroker } from '@src/modes/book_importer/lib/BatchBroker'

interface DocumentSelectorProps {
    nextStep: () => void
    batch: BatchSettings
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({ nextStep, batch }) => {
    const { api, settings } = useAppContext()

    const queryClient = useQueryClient()

    const batchBroker = BatchBroker({ api, queryClient })

    const [selected, setSelected] = useState<Record<string, boolean>>({})
    const [loaded, setloaded] = useState(false)
    const [lastPath, , setLastPath] = settings.makeState('lastImportedPath')
    const [sourcePath, setSourcePath] = useState<string | null>(
        batch.book_path !== undefined ? batch.book_path : null
    )

    const documentsEnabled = sourcePath !== undefined && sourcePath !== null

    useEffect(() => {
        batch?.documents &&
            batch.documents.forEach((document: DocumentFile) => {
                setSelected((prev) => ({ ...prev, [document.name]: true }))
            })
    }, [batch.documents])

    const {
        data: bookImport,
        isLoading: bookImportLoading,
        status: bookStatus
    } = useQuery<ImportedBook>({
        queryKey: ['documents'],
        queryFn: () => api.importer_list_files(sourcePath as string),
        enabled: documentsEnabled
    })

    useEffect(() => {
        if (loaded === false && batch.book_path === undefined && lastPath === undefined) {
            api.importer_find_source(lastPath || '').then((result) => result && setSourcePath(result[0]))
            setloaded(true)
        } else if (batch.book_path) {
            setSourcePath(batch.book_path)
        } else if (lastPath) {
            setSourcePath(lastPath)
        }
    }, [api, lastPath, loaded])

    useEffect(() => {
        if (sourcePath !== undefined && sourcePath !== null) {
            setLastPath(sourcePath)
        }
    }, [sourcePath])

    const columns = useMemo<MRT_ColumnDef<DocumentFile>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name'
            },
            {
                accessorKey: 'created_date',
                header: 'Created on'
            },
            {
                accessorKey: 'modified_last',
                header: 'Modified last'
            },
            {
                accessorKey: 'size',
                header: 'Size',
                Cell: ({ cell }) => {
                    const num = cell.getValue<number>()
                    return <Box>{num.toLocaleString('en-US', { unit: 'byte' })}</Box>
                }
            }
        ],
        []
    )

    const table = useMantineReactTable({
        columns,
        data: (bookImport?.documents || []).sort((a, b) =>
            `${a.name.toLowerCase()}`.localeCompare(b.name.toLowerCase())
        ),
        state: {
            rowSelection: selected
        },
        onRowSelectionChange: setSelected,
        enableColumnActions: false,
        enableColumnFilters: false,
        enablePagination: false,
        enableSelectAll: true,
        enableRowSelection: true,
        enableBottomToolbar: true,
        enableColumnFilterModes: false,
        enableDensityToggle: false,
        enableExpanding: false,
        enableExpandAll: false,
        enableFilters: false,
        enableGlobalFilter: false,
        enableTableFooter: false,
        enableTableHead: true,
        enableHiding: false,
        enableFullScreenToggle: false,
        mantineTableProps: {
            withColumnBorders: true,
            withBorder: true
        },
        getRowId: (originalRow: DocumentFile) => originalRow.name
    })

    const handleImportSelected = () => {
        const selectedRows = table.getSelectedRowModel().rows
        console.log('Documents selected: ', selected)
        batchBroker.set('book_path', sourcePath).then()
        batchBroker
            .set(
                'documents',
                selectedRows.map((row) => row.original)
            )
            .then(() => nextStep())
    }

    if (documentsEnabled === false) {
        return <Text>Select an import path</Text>
    }

    if (documentsEnabled && bookImportLoading) {
        return (
            <>
                <Text>Loading documents</Text>
                <LoadingOverlay visible />
            </>
        )
    }

    if (bookImport === undefined) {
        return (
            <>
                <Text>There was a problem loading the imported files</Text>
            </>
        )
    }

    return (
        <>
            <Group>
                <Title>Importing: {bookImport.dir_name}</Title>
                <Text>Source is: {sourcePath}</Text>
            </Group>
            <MantineReactTable table={table} />
            <Group position='center'>
                <Button onClick={handleImportSelected}>
                    {table.getSelectedRowModel().rows.length} documents will be imported selected
                </Button>
            </Group>
        </>
    )
}
