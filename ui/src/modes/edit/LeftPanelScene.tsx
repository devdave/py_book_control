import { ActiveElementFocusTypes, type ChapterIndex, type SceneIndex } from '@src/types'
import { useAppContext } from '@src/App.context'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { IconFlag, IconFlagFilled, IconId, IconNote } from '@tabler/icons-react'
import { Group, NavLink, Text } from '@mantine/core'
import React from 'react'

interface LeftPanelSceneProps {
    chapterIndex: ChapterIndex
    sceneIndex: SceneIndex
}

export const LeftPanelScene: React.FC<LeftPanelSceneProps> = ({ sceneIndex, chapterIndex }) => {
    const { activeBook } = useAppContext()
    const { sceneBroker, activeElement, setActiveScene } = useEditorContext()

    const isSceneActive = activeElement.isThisScene(sceneIndex)

    const { data: scene, isLoading: sceneIsLoading } = sceneBroker.fetch(
        activeBook.id,
        sceneIndex.chapterId,
        sceneIndex.id,
        isSceneActive
    )

    const statusFlag = sceneIndex.status ? (
        <span title={sceneIndex.status.name}>
            <IconFlagFilled
                style={{
                    color: sceneIndex.status.color
                }}
            />
        </span>
    ) : (
        <IconFlag />
    )

    const hasNotes = isSceneActive && scene?.notes && scene.notes.length > 0
    const hasSummary = isSceneActive && scene?.summary && scene.summary.length > 0

    return (
        <NavLink
            opened={isSceneActive}
            active={isSceneActive}
            label={
                <Group
                    align='start'
                    noWrap
                    pl='xl'
                >
                    <Text weight='bold'>
                        {chapterIndex.order + 1}.{sceneIndex.order + 1}.
                    </Text>
                    <Text>
                        {sceneIndex.title} {statusFlag}
                    </Text>
                </Group>
            }
            onClick={() => setActiveScene(chapterIndex, sceneIndex)}
        >
            {hasNotes && (
                <NavLink
                    active={activeElement.isFocussed(ActiveElementFocusTypes.NOTES)}
                    label={
                        <Text>
                            <IconNote size='0.8rem' /> Notes
                        </Text>
                    }
                    onClick={() => activeElement.assignFocus(ActiveElementFocusTypes.NOTES)}
                />
            )}
            {hasSummary && (
                <NavLink
                    active={activeElement.isFocussed(ActiveElementFocusTypes.SUMMARY)}
                    label={
                        <Text>
                            <IconId size='0.8rem' />
                            Summary
                        </Text>
                    }
                    onClick={() => activeElement.assignFocus(ActiveElementFocusTypes.SUMMARY)}
                />
            )}
        </NavLink>
    )
}
