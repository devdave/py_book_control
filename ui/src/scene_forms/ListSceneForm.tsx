import {Anchor, Textarea, TextInput} from '@mantine/core'
import {useForm, zodResolver} from '@mantine/form'
import React, {type FC} from 'react'
import z from 'zod'

import {useBookContext} from '../Book.context'
import {type Scene} from '../types'
import {useDebouncedEffect} from '../useDebouncedEffect'

interface ListSceneFormProps {
    scene: Scene
    label: string
    field: string
}

const ListSceneForm:React.FC<ListSceneFormProps> = ({}) => {

    return (
        <h1>TODO</h1>
    )

}

export default ListSceneForm;