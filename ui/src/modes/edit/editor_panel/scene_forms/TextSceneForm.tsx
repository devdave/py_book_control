import { Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { KeyboardEventHandler } from 'react'

import { type Scene } from '@src/types'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useEditorContext } from '../../Editor.context'

interface TextSceneFormProps {
    scene: Scene
    field: string
    label: string
    onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>
}

const TextSceneForm: React.FC<TextSceneFormProps> = ({ scene, field, label, onKeyUp }) => {
    const { sceneBroker } = useEditorContext()

    const form = useForm({
        initialValues: {
            [field]: scene[field]
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
            style={{ whiteSpace: 'pre-wrap' }}
            {...form.getInputProps(field)}
        />
    )
}

export default TextSceneForm
