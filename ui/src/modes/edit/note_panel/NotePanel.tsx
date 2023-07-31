import { type Scene } from '@src/types'
import React from 'react'
import { Text } from '@mantine/core'
import { IndicatedTextarea } from '@src/widget/IndicatedTextarea'
import { useForm } from '@mantine/form'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useAppContext } from '@src/App.context'
import { useEditorContext } from '@src/modes/edit/Editor.context'

interface NotePanelProps {
    scene: Scene
}

export const NotePanel: React.FC<NotePanelProps> = ({ scene }) => {
    const { settings } = useAppContext()
    const { sceneBroker } = useEditorContext()

    const [debounceTime] = settings.makeState('debounceTime')

    const form = useForm<Partial<Scene>>({
        initialValues: {
            notes: scene.notes
        }
    })

    useDebouncedEffect(
        () => {
            if (form.isDirty()) {
                if (form.values.notes !== undefined && form.values.notes.length > -1) {
                    sceneBroker.update({ ...scene, notes: form.values.notes }).then(() => {
                        form.resetDirty()
                    })
                }
            }
        },
        [form],
        { delay: debounceTime || 800 }
    )

    return (
        <>
            <Text>Notes</Text>
            <IndicatedTextarea
                form={form}
                formField='notes'
            />
        </>
    )
}
