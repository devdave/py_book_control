import { Button, Textarea, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { type FC, KeyboardEventHandler, useCallback } from 'react'
import z from 'zod'

import { type Scene } from '@src/types'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useAppContext } from '@src/App.context'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { useEditorContext } from '../../Editor.context'

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(3, 'Must be at least 3 characters')
})

export interface SceneContentFormProps {
    scene: Scene
    onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>
}

export const SceneContentForm: FC<SceneContentFormProps> = ({ scene, onKeyUp }) => {
    const { chatBroker } = useAppContext()
    const { sceneBroker } = useEditorContext()
    const form = useForm<Partial<Scene>>({
        initialValues: {
            content: scene.content,
            title: scene.title
        },
        validate: zodResolver(formSchema),
        validateInputOnChange: true
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
            delay: 700
        }
    )

    const handleSummarizeClick = useCallback(async () => {
        if (!form.values.content || form.values.content?.length <= 0) {
            ShowError('Auto-Error', 'Trying to summarize empty content')
            throw Error('Missing/bad content!')
        }
        const response = await chatBroker.summarize(form.values.content as string)
        console.log(response)
    }, [chatBroker, form.values.content])

    return (
        <>
            <TextInput
                autoCapitalize='words'
                label='Title'
                required
                spellCheck
                {...form.getInputProps('title')}
            />
            <Textarea
                className='mainContent'
                onKeyUp={onKeyUp}
                autoCapitalize='sentences'
                autosize
                label='Content'
                minRows={4}
                spellCheck
                data-autofocus
                {...form.getInputProps('content')}
                styles={{ input: { whiteSpace: 'pre-wrap' } }}
            />
            <br />
            <Button onClick={handleSummarizeClick}>Auto-summarize</Button>
        </>
    )
}
