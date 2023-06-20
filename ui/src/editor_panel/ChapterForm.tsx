import {ActionIcon, Button, Group, Paper, Textarea, TextInput} from '@mantine/core'
import {useForm, zodResolver} from '@mantine/form'
import {type FC, useCallback} from 'react'
import z from 'zod'

import {useBookContext} from '../Book.context'
import {type Chapter} from '../types'
import {useDebouncedEffect} from '../lib/useDebouncedEffect'
import {iconSizes} from "@mantine/core/lib/Stepper/Step/Step.styles";
import {IconPlus} from "@tabler/icons-react";

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(4, 'Must be at least 4 characters')
})

export interface ChapterFormProps {
    chapter: Chapter
}

export const ChapterForm: FC<ChapterFormProps> = ({chapter}) => {
    const {updateChapter} = useBookContext()
    const form = useForm({
        initialValues: {
            summary: chapter.summary,
            title: chapter.title
        },
        validate: zodResolver(formSchema),
        validateInputOnChange: true
    })

    useDebouncedEffect(
        () => {

            if (form.isDirty() && form.isValid()) {

                updateChapter({
                    ...chapter,
                    ...form.values
                })
            }
        },
        [form.values],
        {
            delay: 500
        }
    )

    return (
        <>
            <TextInput
                autoCapitalize='words'
                label='Chapter Title'
                required
                spellCheck
                {...form.getInputProps('title')}
            />
            <details open>
                <summary>Summary</summary>
                    <Textarea
                        autoCapitalize='sentences'
                        autosize
                        label='Summary'
                        minRows={4}
                        spellCheck
                        {...form.getInputProps('summary')}
                    />
            </details>
        </>
    )
}
