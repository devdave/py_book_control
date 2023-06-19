import {Anchor, Textarea, TextInput} from '@mantine/core'
import {useForm, zodResolver} from '@mantine/form'
import {type FC} from 'react'
import z from 'zod'

import {useBookContext} from './Book.context'
import {type Scene} from './types'
import {useDebouncedEffect} from './useDebouncedEffect'

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(3, 'Must be at least 3 characters')
})

export interface SceneFormProps {
    scene: Scene
}

export const SceneForm: FC<SceneFormProps> = ({scene}) => {
    const {updateScene} = useBookContext()
    const form = useForm({
        initialValues: {
            summary: scene.summary,
            title: scene.title
        },
        validate: zodResolver(formSchema),
        validateInputOnChange: true
    })

    useDebouncedEffect(
        () => {
            console.log(form.values, form.isDirty(), form.isValid());
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
        <>

            <TextInput
                autoCapitalize='words'
                label='Title'
                required
                spellCheck
                {...form.getInputProps('title')}
            />
            <Textarea
                autoCapitalize='sentences'
                autosize
                label='Summary'
                minRows={4}
                spellCheck
                {...form.getInputProps('summary')}
            />
            <br/>
        </>
    )
}
