import { useImportContext } from '@src/modes/book_importer/BookImporter.context'
import { Button, Center, LoadingOverlay, Table, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { ShowInfo } from '@src/widget/ShowInfoNotification'
import { useAppContext } from '@src/App.context'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { AppModes } from '@src/types'

interface ImportedMessage {
    action: 'show' | 'add_chapter'
}

interface ImportedReport extends ImportedMessage {
    msg: string
}

interface ImportedChapter extends ImportedMessage {
    name: string
    title: string
    scene_ct: number
    word_ct: number
}

export const Process = () => {
    const { batchBroker } = useImportContext()
    const { api, switchBoard, setAppMode, bookBroker } = useAppContext()

    const [chapters, setChapters] = useState<ImportedChapter[]>([])

    const { data: batch, isLoading: batchIsLoading } = batchBroker.fetch()

    const handleUpdates = (payload: ImportedReport | ImportedChapter) => {
        if (payload.action === 'show') {
            // if ('msg' in payload) {
            //     ShowInfo('Importing', payload.msg)
            // }
        } else if (payload.action === 'add_chapter') {
            const status_update: ImportedChapter = payload as ImportedChapter
            setChapters((prior) => [...prior, status_update])
        }
    }

    const runImportProcess = () => {
        const handlerId = switchBoard.generate(handleUpdates)

        api.importer_process_batch(handlerId)
            .then(() => {
                bookBroker.clearCache().then(() => {
                    setAppMode(AppModes.MANIFEST)
                })
            })
            .catch((err: Error) => {
                ShowError('Importing failure', `Import failed with ${err.message}`)
            })
    }

    useEffect(() => {
        runImportProcess()
    }, [])

    if (batchIsLoading) {
        return (
            <>
                <Text>Loading batch data...</Text>
                <LoadingOverlay visible />
            </>
        )
    }

    return (
        <>
            <Title>Import status</Title>
            <Text>The table below will populate as chapters/files are imported</Text>
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Title</th>
                        <th>Scenes</th>
                        <th>Words/Tokens</th>
                    </tr>
                </thead>
                <tbody>
                    {chapters.map((chapter) => (
                        <tr key={chapter.name}>
                            <td>{chapter.name}</td>
                            <td>{chapter.title}</td>
                            <td>{chapter.scene_ct}</td>
                            <td>{chapter.word_ct}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    )
}
