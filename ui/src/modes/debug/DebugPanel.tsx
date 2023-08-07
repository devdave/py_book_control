import { useAppContext } from '@src/App.context'
import { Button, Text } from '@mantine/core'
import { Deferred } from '@src/lib/deferred'
import { useEffect } from 'react'
import { ShowError } from '@src/widget/ShowErrorNotification'

export const DebugPanel = () => {
    const { api, switchBoard } = useAppContext()

    const longTask = () => {
        const responder = (response: Record<string, string>) => {
            ShowError('Remote', `Remote says: ${response.msg} in ${response}`)
        }

        const callBackId = switchBoard.generate(responder)

        api.debug_long_task(callBackId).then()
    }

    return (
        <>
            <Text>Hello world!</Text>
            <Button onClick={() => longTask()}>Call!</Button>
        </>
    )
}
