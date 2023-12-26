import {Book} from "@src/types.ts";
import {useAppContext} from "@src/App.context.ts";
import {ActionIcon, Button, LoadingOverlay, Radio, Table} from "@mantine/core";
import {createSceneStatus, editSceneStatus} from "@src/common/SceneStatusModals.tsx";
import { ShowError } from '@src/widget/ShowErrorNotification'
import {IconEdit, IconFlagFilled, IconX} from "@tabler/icons-react";

export const Statuses = ({book}:{book:Book}) => {

    const {sceneStatusBroker, settings } = useAppContext()

    const [defaultSceneStatus, , setDefaultSceneStatus] = settings.makeState('defaultSceneStatus')

    const {data, isLoading, isError} = sceneStatusBroker.fetchAll(book.id, true)

    if(isLoading){
        return <LoadingOverlay visible/>
    }

    if(isError){
        return (
            <>
                <p>There was a problem loading statuses</p>
            </>
        )
    }

    return (
        <>
            <h2>Statuses</h2>

            <Button
                onClick={() => {
                    createSceneStatus().then((status) => {
                        if (!status.name || status.name.length < 3) {
                            ShowError('Error', 'Status name needs to be aleast 3 characters long')
                        } else if (status && status.name && status.color) {
                            sceneStatusBroker
                                .create(book.id, status.name, status.color)
                                .catch((reason) => {
                                    if (reason instanceof Error || reason.message !== undefined) {
                                        ShowError('Failed to create', reason.message)
                                    }
                                })
                        }
                    })
                }}
            >
                Create new status
            </Button>
            <Radio.Group
                name='defaultSceneStatus'
                value={defaultSceneStatus}
                onChange={(value) => {
                    setDefaultSceneStatus(value)
                }}
            >
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th align='left'>Default status</Table.Th>
                            <Table.Th>Color</Table.Th>
                            <Table.Th colSpan={2}>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>

                        <tr>
                            <td>
                                <Radio
                                    value='-1'
                                    label='Nothing'
                                />
                            </td>
                        </tr>
                        {data?.map((sstatus) => (
                            <tr key={sstatus.id}>
                                <td>
                                    <Radio
                                        value={sstatus.id}
                                        label={sstatus.name}
                                    />
                                </td>
                                <td>
                                    <IconFlagFilled style={{ color: sstatus.color }} />
                                </td>
                                <td>
                                    <ActionIcon
                                        onClick={() => {
                                            editSceneStatus(sstatus.id, sceneStatusBroker.get).then(
                                                (status) => {
                                                    console.log('Edit gave ', status)
                                                    if (status && status.id !== undefined) {
                                                        sceneStatusBroker.update(
                                                            book.id,
                                                            status.id,
                                                            status
                                                        )
                                                    }
                                                }
                                            )
                                        }}
                                    >
                                        <IconEdit />
                                    </ActionIcon>
                                </td>
                                <td>
                                    <ActionIcon
                                        onClick={() => {
                                            sceneStatusBroker.delete(book.id, sstatus.id)
                                        }}
                                    >
                                        <IconX />
                                    </ActionIcon>
                                </td>
                            </tr>
                        ))}

                    </Table.Tbody>
                </Table>
            </Radio.Group>

        </>
    )

}
