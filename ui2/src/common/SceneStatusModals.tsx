import { modals } from '@mantine/modals'
import { SceneStatus, UniqueId } from '@src/types'
import { TextInput, Button, ColorPicker } from '@mantine/core'
import { IconFlagFilled } from '@tabler/icons-react'
import { KeyboardEventHandler } from 'react'

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

export const createSceneStatus = async () => {
    let name = ''
    let color = ''

    return new Promise<Partial<SceneStatus>>((resolve) => {
        const onKeyUp: KeyboardEventHandler<HTMLInputElement> = (evt) => {
            if (evt.key === 'Enter') {
                evt.preventDefault()
                modals.close('ss-create')
                resolve({ name, color })
            }
        }

        modals.open({
            title: 'Create scene status',
            modalId: 'ss-create',
            children: (
                <>
                    <TextInput
                        label='Name'
                        defaultValue={name}
                        onChange={(val) => {
                            name = val.target.value
                        }}
                        onKeyUp={onKeyUp}
                        leftSection={<IconFlagFilled style={{ color }} />}
                    />
                    <ColorPicker
                        defaultValue={color}
                        onChange={(val) => {
                            color = val
                        }}
                        swatches={SWATCHES}
                    />
                    <Button
                        onClick={() => {
                            modals.close('ss-create')
                            resolve({ name, color })
                        }}
                    >
                        Create
                    </Button>
                </>
            )
        })
    })
}

export const editSceneStatus = async (
    statusUid: UniqueId,
    getter: (uid: UniqueId) => Promise<SceneStatus>
) => {
    const sceneStatus = await getter(statusUid)

    return new Promise<SceneStatus>((resolve) => {
        const onKeyUp: KeyboardEventHandler<HTMLInputElement> = (evt) => {
            if (evt.key === 'Enter') {
                evt.preventDefault()
                modals.close(`ss-${statusUid}`)
                resolve(sceneStatus)
            }
        }

        modals.open({
            title: 'Scene status editor',
            modalId: `ss-${statusUid}`,
            children: (
                <>
                    <TextInput
                        label='Name'
                        defaultValue={sceneStatus.name}
                        onChange={(val) => {
                            sceneStatus.name = val.target.value
                        }}
                        onKeyUp={onKeyUp}
                        leftSection={<IconFlagFilled style={{ color: sceneStatus.color }} />}
                    />
                    <ColorPicker
                        defaultValue={sceneStatus.color}
                        onChange={(val) => {
                            sceneStatus.color = val
                        }}
                        swatches={SWATCHES}
                    />
                    <Button
                        onClick={() => {
                            modals.close(`ss-${statusUid}`)
                            resolve(sceneStatus)
                        }}
                    >
                        Update
                    </Button>
                </>
            )
        })
    })
}
