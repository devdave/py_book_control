import { Anchor, Textarea, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { type FC, KeyboardEventHandler, MouseEventHandler } from 'react'
import z from 'zod'

import { useEditorContext } from '../../Editor.context'
import { type Scene } from '../../../../types'
import { useDebouncedEffect } from '../../../../lib/useDebouncedEffect'

interface TextSceneFormProps {
    scene: Scene
    field: string
    label: string
    onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>
}

const TextSceneForm: React.FC<TextSceneFormProps> = ({ scene, field, label, onKeyUp }) => {
    const { updateScene } = useEditorContext()

    const form = useForm({
        initialValues: {
            [field]: scene[field]
        }
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
            delay: 300
        }
    )

    return (
        <Textarea
            autosize
            minRows={5}
            label={label}
            autoCapitalize='sentences'
            onKeyUp={onKeyUp}
            {...form.getInputProps(field)}
        />
    )
}

export default TextSceneForm
