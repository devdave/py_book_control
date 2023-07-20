import { Anchor, Textarea, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { type FC, KeyboardEventHandler } from 'react'
import z from 'zod'

import { useEditorContext } from '../../Editor.context'
import { type Scene } from '../../../../types'
import { useDebouncedEffect } from '../../../../lib/useDebouncedEffect'

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(3, 'Must be at least 3 characters')
})

export interface SceneFormProps {
    scene: Scene
    onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>
}

export const MainSceneForm: FC<SceneFormProps> = ({ scene, onKeyUp }) => {
    const { updateScene } = useEditorContext()
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
                updateScene({
                    ...scene,
                    ...form.values
                })
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
