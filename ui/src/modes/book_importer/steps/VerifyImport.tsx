import { Button, Center, Stack, Text, Title } from '@mantine/core'
import { BatchSettings } from '@src/modes/book_importer/types'
import { IconFlagFilled } from '@tabler/icons-react'
import { useImportContext } from '@src/modes/book_importer/BookImporter.context'
import { ActiveStages } from '@src/modes/book_importer/lib/active-stage'

interface VerifyImportProps {
    batch: BatchSettings
}

export const VerifyImport: React.FC<VerifyImportProps> = ({ batch }) => {
    const { activeStage } = useImportContext()

    const onVerified = () => {
        activeStage.current = ActiveStages.PROCESS
    }

    return (
        <>
            <Stack>
                <Center>
                    <Title>Verification</Title>
                </Center>
                <Center>
                    <Text>
                        Once more, nothing is written in stone. You can always go back and re-import a file,
                        change title, modify status flag, etc
                    </Text>
                </Center>

                <Center>
                    <fieldset>
                        <legend>Basic options</legend>

                        <Text>
                            Title: <Text fw={700}>{batch.name_and_status?.book_name}</Text>
                        </Text>

                        {batch.name_and_status?.have_default_status === true && (
                            <Text>
                                Default status flag will be:{`"${batch.name_and_status.default_status}"`}
                                <IconFlagFilled style={{ color: batch.name_and_status?.status_color }} />
                            </Text>
                        )}
                    </fieldset>
                </Center>
                <Center>
                    <fieldset>
                        <legend>File imports</legend>
                        <Text>Importing from: {`${batch.book_path}`}</Text>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Created</th>
                                    <th>Modified</th>
                                    <th>Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batch.documents?.map((doc) => (
                                    <tr key={doc.name}>
                                        <td>{doc.name}</td>
                                        <td>{doc.created_date}</td>
                                        <td>{doc.modified_last}</td>
                                        <td>{doc.size}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </fieldset>
                </Center>
                <Button onClick={onVerified}>Looks good, proceed!</Button>
            </Stack>
        </>
    )
}
