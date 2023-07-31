import { useAppContext } from '@src/App.context'
import { Skeleton, Text } from '@mantine/core'

export const BookMaker = () => {
    const { settings } = useAppContext()

    return (
        <>
            <Text>Book creation</Text>
            <Skeleton />
            <Skeleton />
            <Skeleton />
        </>
    )
}
