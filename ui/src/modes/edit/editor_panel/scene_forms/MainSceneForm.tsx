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
    nextTab: () => void
}

export const MainSceneForm: FC<SceneFormProps> = ({ scene, nextTab }) => {
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

    const handleCtrlTab: KeyboardEventHandler = (evt) => {
        if (evt.ctrlKey && evt.key === 'Tab') {
            evt.preventDefault()
            nextTab()
            console.log('Tried to move to next tab')
        }
    }

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
                onKeyUp={handleCtrlTab}
                autoCapitalize='sentences'
                autosize
                label='Content'
                minRows={4}
                spellCheck
                {...form.getInputProps('content')}
            />
            <br />
        </>
    )
}
