import { useEditorContext } from '@src/modes/edit/Editor.context'
import { useAppContext } from '@src/App.context'
import { LoadingOverlay, Text, Title } from '@mantine/core'
import { IconFlagFilled } from '@tabler/icons-react'
import { SceneStatusEditor } from '@src/common/SceneStatusEditor'

export const StatusPanel = () => {
    const { activeBook, sceneStatusBroker } = useAppContext()
    const { sceneBroker } = useEditorContext()

    const {
        data: stati,
        isLoading: statiLoading,
        status: statiLoadingStatus
    } = sceneStatusBroker.fetchAll(activeBook.id, true)

    if (statiLoading) {
        return <LoadingOverlay visible />
    }
    if (statiLoadingStatus === 'error') {
        return <Text>There was a problem loading book statuses</Text>
    }
    if (!stati) {
        return <Text>Somehow statuses were successfully not loaded, I am as confused as you are.</Text>
    }

    return (
        <>
            <Title>Available statuses</Title>
            <SceneStatusEditor />
        </>
    )
}
