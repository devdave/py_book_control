import {Book, Scene} from "@src/types.ts";
import {Indicator, Table, Textarea, Text} from "@mantine/core";
import {useAppContext} from "@src/App.context.ts";
import {useForm} from "@mantine/form";
import {useDebouncedEffect} from "@src/lib/useDebouncedEffect.ts";
import {IndicatedTextInput} from "@src/widget/IndicatedTextInput.tsx";

export const BookOverview = ({book}:{book:Book}) => {

    const {settings, bookBroker} = useAppContext()
    const [debounceTime, , ] = settings.makeState("debounceTime")

    const form = useForm<Partial<Book>>({
        initialValues: {
            title: book.title,
            notes: book.notes
        }
    })

    useDebouncedEffect(
        () => {
            if (form.isDirty()) {
                const book_changes = {
                    id: book.id,
                    notes: form.values.notes,
                    title: form.values.title
                }
                form.resetDirty()
                bookBroker.update(book_changes).then((_updated_book: Book) => {
                    book.title = _updated_book.title
                    book.notes = _updated_book.notes
                })
            }
        },
        [form],
        { delay: debounceTime || 900 }
    )

    return (
        <>
            <h2>Datum</h2>
            <data>
                <dt>Created</dt>
                <dd>{book.created_on}</dd>

                <dt>Last update</dt>
                <dd>{book.updated_on}</dd>

                <dt>Word count</dt>
                <dd>{parseInt(book.words.toString(),10).toLocaleString()}</dd>
            </data>

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

            <h2>Word Counts</h2>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Chapter name</Table.Th>
                        <Table.Th>Scene Name</Table.Th>
                        <Table.Th>Estimated Word count</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {book.chapters.map((chapter)=>(
                        <>
                            <Table.Tr key={chapter.id}>
                                <Table.Td>{chapter.title}</Table.Td>
                                <Table.Td>&nbsp;</Table.Td>
                                <Table.Td>{parseInt(chapter.words.toString(),10).toLocaleString()}</Table.Td>
                            </Table.Tr>
                            {chapter.scenes.map((scene:Scene)=>(
                                <Table.Tr key={scene.id}>
                                    <Table.Td>&nbsp;</Table.Td>
                                    <Table.Td>{scene.title}</Table.Td>
                                    <Table.Td>{parseInt(scene.words.toString(),10).toLocaleString()}</Table.Td>
                                </Table.Tr>
                            ))}

                        </>
                    ))}
                </Table.Tbody>
            </Table>

        </>
    )


}
