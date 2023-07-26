import React, { FC } from 'react'
import { Button, ColorInput, Modal, TextInput } from '@mantine/core'

interface SceneStatusMakerProps {
    opened: boolean
    onClose: () => void
}
export const SceneStatusMaker: FC<SceneStatusMakerProps> = ({ opened, onClose }) => {
    const createStati = () => {
        console.log('Make a status')
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title='Create scene status'
        >
            <TextInput label='Scene status name' />
            <ColorInput
                placeholder='Status color'
                label='Scene status color'
                swatches={[
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
                ]}
            />
            <Button onClick={createStati}>Create</Button>
        </Modal>
    )
}
