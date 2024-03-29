import { Indicator, Text, Textarea, TextInput } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useForm } from '@mantine/form'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { Book } from '@src/types'
import { IndicatedTextInput } from '@src/widget/IndicatedTextInput'

export const BookPanel: React.FC = () => {
    const { activeBook, bookBroker, settings } = useAppContext()

    const [debounceTime] = settings.makeState('debounceTime')

    const form = useForm<Partial<Book>>({
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
                bookBroker.update(book_changes).then((updated_book: Book) => {
                    form.resetDirty()
                })
            }
        },
        [form],
        { delay: debounceTime || 900 }
    )

    return (
        <>
            <IndicatedTextInput
                form={form}
                fieldName='title'
                label='Book Title'
                inputprops={form.getInputProps('title')}
            />

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
            <table>
                <thead>
                    <tr>
                        <th>Chapter name</th>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                        <th>Scene name</th>
                        <th>Words</th>
                    </tr>
                </thead>
                <tbody>
                    {activeBook.chapters.map((chapter, idx) => (
                        <>
                            <tr key={idx}>
                                <td>{chapter.title}</td>
                            </tr>
                            {chapter.scenes.map((scene, sidx) => (
                                <tr key={sidx}>
                                    <td>&nbsp;</td>
                                    <td>{scene.title}</td>
                                    <td>{scene.words}</td>
                                </tr>
                            ))}
                        </>
                    ))}
                </tbody>
            </table>
            <label>JSON</label>
            <pre style={{ maxWidth: '60vw', whiteSpace: 'pre-wrap' }}>{JSON.stringify(activeBook)}</pre>
        </>
    )
}
