import {Anchor, Textarea, TextInput} from '@mantine/core'
import {useForm, zodResolver} from '@mantine/form'
import {type FC} from 'react'
import z from 'zod'

import {useBookContext} from '../../Editor.context'
import {type Scene} from '../../../../types'
import {useDebouncedEffect} from '../../../../lib/useDebouncedEffect'

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(3, 'Must be at least 3 characters')
})

export interface SceneFormProps {
    scene: Scene
}

export const MainSceneForm: FC<SceneFormProps> = ({scene}) => {
    const {updateScene} = useBookContext()
    const form = useForm({
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
                label='Content'
                minRows={4}
                spellCheck
                {...form.getInputProps('content')}
            />
            <br/>
        </>
    )
}
