import { ActiveElementTypes, EditModes } from '@src/types'
import { RightPanel } from '@src/modes/edit/editor_panel/RightPanel'
import { ContinuousBody } from '@src/modes/edit/continuous_panel'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { LoadingOverlay, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { BookPanel } from '@src/modes/edit/book_panel/BookPanel'
import { CharacterPanel } from '@src/modes/edit/character_panel/CharacterPanel'
import { ChapterPanel } from '@src/modes/edit/chapter_panel/ChapterPanel'

export const Body = () => {
    const { activeBook } = useAppContext()
    const { editMode, fetchChapter, activeChapter, activeScene, activeElement } = useEditorContext()

    if (activeElement.type === ActiveElementTypes.BOOK) {
        return <BookPanel />
    }
    if (activeElement.type === ActiveElementTypes.CHARACTERS) {
        return <CharacterPanel />
    }

    switch (editMode) {
        case EditModes.LIST:
            if (activeChapter !== undefined) {
                if (activeElement.subType === 'scene') {
                    return (
                        <RightPanel
                            key={`${activeChapter.updated_on} ${activeChapter.id}-${activeScene?.id}`}
                        />
                    )
                }
                const { data: fullChapter, isLoading: fullChapterIsLoading } = fetchChapter(
                    activeBook.id,
                    activeChapter.id
                )
                if (fullChapter && !fullChapterIsLoading) {
                    return <ChapterPanel chapter={fullChapter} />
                }
                return <LoadingOverlay visible />
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
