import { useAppContext } from '@src/App.context'
import { ActionIcon, Button, Drawer, LoadingOverlay, Radio, Text, Title } from '@mantine/core'
import { createSceneStatus, editSceneStatus } from '@src/common/SceneStatusModals'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { IconEdit, IconFlagFilled, IconX } from '@tabler/icons-react'
import React from 'react'

export const SceneStatusEditor = () => {
    const { activeBook, sceneStatusBroker, settings } = useAppContext()

    const [defaultSceneStatus, , setDefaultSceneStatus] = settings.makeState('defaultSceneStatus')

    const isReadyToFetchSceneStatus = activeBook.title !== undefined

    const { data: stati, isLoading: statiLoading } = sceneStatusBroker.fetchAll(
        activeBook.id,
        isReadyToFetchSceneStatus
    )

    if (statiLoading && isReadyToFetchSceneStatus) {
        return (
            <>
                <Text>Loading statuses...</Text>
                <LoadingOverlay visible />
            </>
        )
    }

    return (
        <>
            <Button
                onClick={() => {
                    createSceneStatus().then((status) => {
                        if (!status.name || status.name.length < 3) {
                            ShowError('Error', 'Status name needs to be aleast 3 characters long')
                        } else if (status && status.name && status.color) {
                            sceneStatusBroker
                                .create(activeBook.id, status.name, status.color)
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
            <table>
                <tr>
                    <th align='left'>Default status</th>
                </tr>
                <tbody>
                    <Radio.Group
                        name='defaultSceneStatus'
                        value={defaultSceneStatus}
                        onChange={(value) => {
                            setDefaultSceneStatus(value)
                        }}
                    >
                        <tr>
                            <td>
                                <Radio
                                    value='-1'
                                    label='Nothing'
                                />
                            </td>
                        </tr>
                        {stati?.map((sstatus) => (
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
                                                            activeBook.id,
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

                                <ActionIcon
                                    onClick={() => {
                                        sceneStatusBroker.delete(activeBook.id, sstatus.id)
                                    }}
                                >
                                    <IconX />
                                </ActionIcon>
                                <td />
                            </tr>
                        ))}
                    </Radio.Group>
                </tbody>
            </table>
        </>
    )
}
