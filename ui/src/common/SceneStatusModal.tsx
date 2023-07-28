import React, { FC, KeyboardEventHandler, useEffect } from 'react'
import { Button, Text, ColorPicker, Modal, TextInput, LoadingOverlay } from '@mantine/core'
import { IconFlag, IconFlagFilled } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useAppContext } from '@src/App.context'
import { type UniqueId } from '@src/types'
import { modals } from '@mantine/modals'

const SWATCHES = [
    '#fa5252',
    '#e64980',
    '#be4bdb',
    '#7950f2',
    '#4c6ef5',
    '#228be6',
    '#15aabf',
    '#12b886',
    '#40c057',
    '#82c91e',
    '#fab005',
    '#fd7e14'
]

interface SceneStatusMakerProps {
    opened: boolean
    onClose: () => void
    status_uid?: UniqueId
}

export const SceneStatusModal: FC<SceneStatusMakerProps> = ({ opened, onClose, status_uid }) => {
    const { activeBook, sceneStatusBroker } = useAppContext()
    const createStati = () => {
        console.log('Make a status')
    }

    const { data: loadedSceneStatus } = sceneStatusBroker.fetch(
        activeBook.id,
        status_uid as UniqueId,
        status_uid !== undefined
    )

    const form = useForm({
        initialValues: {
            name: loadedSceneStatus?.name || '',
            color: loadedSceneStatus?.color || '#e50909'
        }
    })

    const clickedCreateStatus = async () => {
        const new_status = await sceneStatusBroker.create(activeBook.id, form.values.name, form.values.color)
        form.setValues({ name: '', color: '#e50909' })
        onClose()
        console.log('Got a new status!', new_status)
    }

    const onKeyUpEnter: KeyboardEventHandler<HTMLInputElement> = (evt) => {
        if (evt.key === 'Enter') {
            clickedCreateStatus()
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title='Scene status'
        >
            {status_uid && loadedSceneStatus !== undefined && (
                <>
                    <Text>Fetching status record...</Text>
                    <LoadingOverlay visible />
                </>
            )}
            <TextInput
                label='Scene status name'
                color={form.values.color}
                styles={{
                    icon: {
                        color: form.values.color
                    }
                }}
                icon={<IconFlagFilled />}
                {...form.getInputProps('name')}
                onKeyUp={onKeyUpEnter}
            />
            <Text>Status flag color</Text>
            <ColorPicker
                format='hex'
                placeholder='Status color'
                {...form.getInputProps('color')}
                swatches={SWATCHES}
            />
            <Button onClick={clickedCreateStatus}>Create</Button>
        </Modal>
    )
}
