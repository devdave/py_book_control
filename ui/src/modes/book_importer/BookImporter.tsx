import { useAppContext } from '@src/App.context'
import { Box, Button, Group, LoadingOverlay, Skeleton, Text, Title } from '@mantine/core'
import React, { useEffect, useMemo, useState } from 'react'
import { DocumentFile, ImportedBook } from '@src/types'
import { useQuery } from '@tanstack/react-query'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table'
import { number } from 'zod'

export const BookImporter: React.FC = () => {
    const { bookBroker, api, settings } = useAppContext()

    const [loaded, setloaded] = useState(false)
    const [lastPath, , setLastPath] = settings.makeState('lastImportedPath')
    const [sourcePath, setSourcePath] = useState<string | null>(null)

    const documentsEnabled = sourcePath !== undefined && sourcePath !== null

    const { data: bookImport, isLoading: bookImportLoading } = useQuery<ImportedBook>({
        queryKey: ['documents'],
        queryFn: () => api.importer_list_files(sourcePath as string),
        enabled: documentsEnabled
    })

    useEffect(() => {
        if (loaded === false) {
            api.importer_find_source(lastPath || '').then((result) => result && setSourcePath(result[0]))
            setloaded(true)
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
        enableTableHead: false,
        enableHiding: false,
        enableFullScreenToggle: false,
        initialState: {
            density: 'xs'
        },
        mantineTableProps: {
            withColumnBorders: true,
            withBorder: true
        },
        getRowId: (originalRow: DocumentFile) => originalRow.name
    })

    const handleImportSelected = () => {
        const selected = table.getSelectedRowModel().rows
        console.log('Documents selected: ', selected.length)
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
                <Button onClick={handleImportSelected}>Import selected</Button>
            </Group>
        </>
    )
}
