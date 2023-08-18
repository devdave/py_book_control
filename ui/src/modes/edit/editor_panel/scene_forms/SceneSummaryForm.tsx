import React, { KeyboardEventHandler, useCallback } from 'react'
import { Button, Text, Textarea } from '@mantine/core'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { Scene } from '@src/types'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useForm } from '@mantine/form'
import { useAppContext } from '@src/App.context'
import { ShowError } from '@src/widget/ShowErrorNotification'

interface SceneSummaryFormProps {
    scene: Scene
    onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>
}

export const SceneSummaryForm: React.FC<SceneSummaryFormProps> = ({ scene, onKeyUp }) => {
    const { settings, chatBroker } = useAppContext()
    const { sceneBroker } = useEditorContext()

    const [debouncetime, ,] = settings.makeState('debounceTime')

    const form = useForm({
        initialValues: {
            summary: scene.summary
        }
    })

    useDebouncedEffect(
        () => {
            if (form.isDirty() && form.isValid()) {
                sceneBroker
                    .update({
                        ...scene,
                        ...form.values
                    })
                    .then()
            }
        },
        [form.values],
        {
            delay: debouncetime || 800
        }
    )

    const handleSummarizeClick = useCallback(async () => {
        if (!scene.content || scene.content.length <= 0) {
            ShowError('Auto error', 'Cannot summarize empty content')
            throw Error('Missing content')
        }
        const response = chatBroker.summarize(scene.content)
        console.log(response)
    }, [scene.content, chatBroker])

    return (
        <>
            <Textarea
                autosize
                minRows={5}
                label='Summary'
                autoCapitalize='sentences'
                onKeyUp={onKeyUp}
                style={{ whiteSpace: 'pre-wrap' }}
                {...form.getInputProps('summary')}
            />
            <Button onClick={handleSummarizeClick}>Auto-summarize</Button>
        </>
    )
}
