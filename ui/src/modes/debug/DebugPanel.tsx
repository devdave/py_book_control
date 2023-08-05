import { useAppContext } from '@src/App.context'
import { Text } from '@mantine/core'

export const DebugPanel = () => {
    const { api } = useAppContext()

    return (
        <>
            <Text>Hello world!</Text>
        </>
    )
}
