import { EditModes } from '@src/types'
import { RightPanel } from '@src/modes/edit/editor_panel/RightPanel'
import { ContinuousBody } from '@src/modes/edit/continuous_panel'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { BookPanel } from '@src/modes/edit/book_panel/BookPanel'

export const Body = () => {
    const { editMode, activeChapter, activeScene, activeElement } = useEditorContext()
    const { activeBook } = useAppContext()

    if (activeElement.isThisBook(activeBook)) {
        return <BookPanel />
    }

    switch (editMode) {
        case EditModes.LIST:
            if (activeChapter !== undefined) {
                return <RightPanel key={`${activeChapter.updated_on} ${activeChapter.id}-${activeScene?.id}`} />
            }
            return <h2>Create a new chapter!</h2>

            break
        case EditModes.FLOW:
            if (activeChapter !== undefined) {
                return <ContinuousBody key={`${activeChapter.updated_on} ${activeChapter.id}`} />
            }
            return <h2>Create a new chapter!</h2>

        default:
            return <Text>Error: unknown edit mode {editMode}</Text>
    }
}
