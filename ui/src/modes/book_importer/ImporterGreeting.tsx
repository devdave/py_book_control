import { Center, Group, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'

export const ImporterGreeting = () => {
    const { api } = useAppContext()

    return (
        <Center>
            <Group
                position='center'
                style={{ maxWidth: '45vw' }}
            >
                <br />
                <Text>
                    In the following steps you will be asked to make some choices about how your book will be
                    setup.
                </Text>
                <Text>
                    With little to no exception, nothing is written in stone and can be changed later.
                </Text>
                <Text>That even includes the import process!</Text>
            </Group>
        </Center>
    )
}
