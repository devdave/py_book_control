import { notifications } from '@mantine/notifications'
import { IconInfoSquareRounded, IconX } from '@tabler/icons-react'

export const ShowInfo = (title: string, message: string) => {
    notifications.show({
        title,
        message,
        icon: <IconInfoSquareRounded />,
        color: 'green',
        autoClose: 4000
    })
}
