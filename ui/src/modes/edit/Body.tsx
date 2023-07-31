import {
    ActiveElementFocusTypes,
    ActiveElementSubTypes,
    ActiveElementTypes,
    EditModes,
    Scene
} from '@src/types'
import { RightPanel } from '@src/modes/edit/editor_panel/RightPanel'
import { ContinuousBody } from '@src/modes/edit/continuous_panel'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { LoadingOverlay, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { BookPanel } from '@src/modes/edit/book_panel/BookPanel'
import { CharacterPanel } from '@src/modes/edit/character_panel/CharacterPanel'
import { ChapterPanel } from '@src/modes/edit/chapter_panel/ChapterPanel'
import { NotePanel } from '@src/modes/edit/note_panel/NotePanel'
import { StatusPanel } from '@src/modes/edit/status_panel/StatusPanel'

export const Body = () => {
    const { activeBook } = useAppContext()
    const { editMode, chapterBroker, sceneBroker, activeChapter, activeScene, activeElement } =
        useEditorContext()

    const { data: fullChapter, status: fullChapterStatus } = chapterBroker.fetch(
        activeBook.id,
        activeChapter?.id,
        activeChapter !== undefined
    )

    const sceneFetchIsEnabled =
        activeChapter?.id !== undefined &&
        activeScene?.id !== undefined &&
        activeElement.get_subType() === ActiveElementSubTypes.SCENE

    const { data: fullScene, status: fullSceneStatus } = sceneBroker.fetch(
        activeBook.id,
        activeChapter?.id,
        activeScene?.id,
        sceneFetchIsEnabled
    )

    switch (activeElement.get_type()) {
        case ActiveElementTypes.BOOK:
            return <BookPanel />
        case ActiveElementTypes.CHARACTERS:
            return <CharacterPanel />
        case ActiveElementTypes.STATUSES:
            return <StatusPanel />
    }

    if (
        activeElement.get_type() === ActiveElementTypes.CHAPTER &&
        activeElement.get_subType() === undefined
    ) {
        if (fullChapter) {
            return <ChapterPanel chapter={fullChapter} />
        }

        return <LoadingOverlay visible />
    }

    const commonKey = `${activeChapter?.id}-${activeScene?.id}`

    if (sceneFetchIsEnabled) {
        switch (fullSceneStatus) {
            case 'loading':
                return <LoadingOverlay visible />
            case 'error':
                return <Text>Failed loading scene data</Text>
        }
    }

    if (activeChapter !== undefined) {
        if (activeElement.get_subType() === ActiveElementSubTypes.SCENE) {
            if (activeElement.get_focus() !== undefined) {
                switch (activeElement.get_focus()) {
                    case ActiveElementFocusTypes.NOTES:
                        return (
                            <NotePanel
                                scene={fullScene as Scene}
                                key={commonKey}
                            />
                        )
                    case ActiveElementFocusTypes.SUMMARY:
                        return <Text>Summary view panel</Text>
                }
            } else if (fullChapter && fullChapterStatus === 'success') {
                switch (editMode) {
                    case EditModes.FLOW:
                        return (
                            <ContinuousBody
                                chapter={fullChapter}
                                key={commonKey}
                            />
                        )
                    case EditModes.LIST:
                        return <RightPanel key={commonKey} />
                    default:
                        return <Text>Unexpected edit mode {editMode}</Text>
                }
            } else if (fullChapterStatus === 'loading') {
                return <LoadingOverlay visible />
            } else if (fullSceneStatus === 'error') {
                return <Text>Failed loading chapter data</Text>
            }
        }
        return <h2>Create a new chapter!</h2>
    }
    return <Text>Unexpected behavior, not sure how we got here.</Text>
}
