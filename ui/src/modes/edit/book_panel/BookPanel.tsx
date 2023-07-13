import { Indicator, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useForm } from '@mantine/form'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'

export const BookPanel: React.FC = () => {
    const { activeBook, updateBook, debounceTime } = useAppContext()

    const form = useForm({
        initialValues: {
            title: activeBook.title,
            notes: activeBook.notes
        }
    })

    useDebouncedEffect(
        () => {
            if (form.isDirty()) {
                const book_changes = {
                    id: activeBook.id,
                    notes: form.values.notes,
                    title: form.values.title
                }
                updateBook(book_changes)
            }
        },
        [form],
        { delay: debounceTime }
    )

    return (
        <>
            <Text>Book title</Text>
            <Indicator
                processing
                disabled={!form.isDirty('title')}
                color='red'
                position='top-end'
            >
                <TextInput {...form.getInputProps('title')} />
            </Indicator>

            <Text>Notes</Text>
            <Indicator
                processing
                disabled={!form.isDirty('notes')}
                color='red'
                position='top-end'
            >
                <Textarea
                    autosize
                    minRows={5}
                    {...form.getInputProps('notes')}
                />
            </Indicator>
        </>
    )
}
