import {Anchor, Textarea, TextInput} from '@mantine/core'
import {useForm, zodResolver} from '@mantine/form'
import {type FC} from 'react'
import z from 'zod'

import {useBookContext} from '../../Book.context'
import {type Scene} from '../../types'
import {useDebouncedEffect} from '../../lib/useDebouncedEffect'

interface TextSceneFormProps {
    scene: Scene
    field: string
    label: string
}

const TextSceneForm:React.FC<TextSceneFormProps> = ({scene, field, label}) => {
    const {updateScene} = useBookContext();


    const form = useForm({
        initialValues: {
            [field]: scene[field]
        }
    });

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
    );

    return (
        <Textarea
            autosize
            minRows={5}
            label={label}
            autoCapitalize="sentences"
            {...form.getInputProps(field)}
        />
    )



}

export default TextSceneForm;