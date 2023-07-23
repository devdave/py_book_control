import { Textarea, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { type FC, KeyboardEventHandler } from 'react'
import z from 'zod'

import { type Scene } from '@src/types'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useEditorContext } from '../../Editor.context'

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(3, 'Must be at least 3 characters')
})

export interface SceneFormProps {
    scene: Scene
    onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>
}

export const MainSceneForm: FC<SceneFormProps> = ({ scene, onKeyUp }) => {
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
                onKeyUp={onKeyUp}
                autoCapitalize='sentences'
                autosize
                label='Content'
                minRows={4}
                spellCheck
                data-autofocus
                autoFocus
                {...form.getInputProps('content')}
            />
            <br />
        </>
    )
}
