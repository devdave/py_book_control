import { Indicator, Text, Textarea, TextInput } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useForm } from '@mantine/form'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { Book } from '@src/types'

export const BookPanel: React.FC = () => {
    const { activeBook, updateBook, settings } = useAppContext()

    const [debounceTime] = settings.makeState('debounceTime')

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
                updateBook(book_changes).then((updated_book: Book) => {
                    console.log('Updated book ', updated_book)
                    form.resetDirty()
                })
            }
        },
        [form],
        { delay: debounceTime || 900 }
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
