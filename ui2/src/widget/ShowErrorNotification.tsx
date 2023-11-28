import { notifications } from '@mantine/notifications'
import { IconX } from '@tabler/icons-react'

export const ShowError = (title: string, message: string) => {
    notifications.show({
        title,
        message,
        icon: <IconX />,
        color: 'red',
        autoClose: 4000
    })
}
