import { modals } from '@mantine/modals'
import { Text } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'

export function ConfirmModal(title: string, prompt: string): Promise<boolean> {
    return new Promise((resolve) => {
        modals.openConfirmModal({
            title,
            children: <Text>{prompt}</Text>,
            labels: { confirm: 'Yes', cancel: 'Abort!' },
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
            onClose: () => resolve(false)
        })
    })
}
