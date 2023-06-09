import { ActionIcon, Button, Group, Paper, Textarea, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { type FC, useCallback } from 'react'
import z from 'zod'

import { iconSizes } from '@mantine/core/lib/Stepper/Step/Step.styles'
import { IconPlus } from '@tabler/icons-react'
import { useEditorContext } from '../Editor.context'
import { type Chapter } from '../../../types'
import { useDebouncedEffect } from '../../../lib/useDebouncedEffect'

const formSchema = z.object({
    title: z.string().trim().nonempty('Cannot be empty').min(3, 'Must be at least 3 characters')
})

export interface ChapterFormProps {
    chapter: Chapter
}

export const ChapterForm: FC<ChapterFormProps> = ({ chapter }) => {
    const { updateChapter } = useEditorContext()
    const form = useForm({
        initialValues: {
            summary: chapter.summary,
            notes: chapter.notes,
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
            <details>
                <summary>Chapter Notes</summary>
                <Textarea
                    autoCapitalize='sentences'
                    autosize
                    minRows={4}
                    spellCheck
                    {...form.getInputProps('notes')}
                />
            </details>
            <details>
                <summary>Chapter Summary</summary>
                <Textarea
                    autoCapitalize='sentences'
                    autosize
                    minRows={4}
                    spellCheck
                    {...form.getInputProps('summary')}
                />
            </details>
        </>
    )
}
