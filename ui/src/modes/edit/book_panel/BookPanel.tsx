import { Indicator, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useForm } from '@mantine/form'

export const BookPanel: React.FC = () => {
    const { activeBook } = useAppContext()

    const form = useForm({
        initialValues: {
            title: activeBook.title,
            notes: activeBook.notes
        }
    })

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
