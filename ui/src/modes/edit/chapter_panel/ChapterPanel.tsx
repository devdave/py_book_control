import { Button, Text } from '@mantine/core'
import React from 'react'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { type Chapter } from '@src/types'
import { useAppContext } from '@src/App.context'

interface ChapterPanelProps {
    chapter: Chapter
}

export const ChapterPanel: React.FC<ChapterPanelProps> = ({ chapter }) => {
    const { api } = useAppContext()
    const { chapterBroker } = useEditorContext()

    //Let's see what we got
    console.log('ActiveChapter', chapter)

    const onClickReimport = () => {
        api.importer_reimport_chapter(chapter.id).then(() =>
            chapterBroker.clearChapterCache(chapter.book_id, chapter.id).then()
        )
    }

    return (
        <>
            <Text>Chapter: {chapter.title}</Text>
            <dl>
                <dt>Source file</dt>
                <dd>{chapter.source_file}</dd>

                <dt>Source size</dt>
                <dd>{chapter.source_size}</dd>

                <dt>Last modified</dt>
                <dd>TO FIX! {chapter.last_imported}</dd>

                <dt>Last imported</dt>
                <dd>{chapter.last_imported}</dd>

                <dt>Est. token/words</dt>
                <dd>{chapter.words}</dd>
            </dl>
            {chapter.source_file && <Button onClick={onClickReimport}>Re-import</Button>}
        </>
    )
}
