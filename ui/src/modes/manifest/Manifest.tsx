import {
    ActionIcon,
    createStyles,
    Group,
    Header,
    Paper,
    Skeleton,
    Stack,
    Switch,
    Table,
    Text,
    Title,
    useMantineColorScheme
} from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { AppModes, Book, UID } from '@src/types'
import React, { MouseEventHandler, useCallback, useState } from 'react'

import './manifest.css'
import { IconMoonStars, IconSettings, IconSun } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { SettingsDrawer } from '@src/common/SettingsDrawer'

const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    }
}))

export const Manifest = () => {
    const { api, setActiveBook, setAppMode, fetchStrippedBook, fetchStrippedBooks } = useAppContext()

    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const [highlightBookID, setHighLightBookID] = useState<UID | undefined>()

    const [opened, { open, close }] = useDisclosure(false)

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const { data: books, isLoading: booksAreLoading } = fetchStrippedBooks()

    const {
        data: highlightedBook,
        status: highlightStatus,
        isFetched: highlightedIsFetched,
        isLoading: highlightedIsLoading
    } = fetchStrippedBook(highlightBookID as UID)

    if (booksAreLoading) {
        return (
            <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </>
        )
    }

    const handleBookClick: MouseEventHandler<HTMLElement> = async (evt) => {
        const { bookId } = evt.currentTarget.dataset
        if (bookId === undefined) {
            console.error('Got a bad bookId for ', evt)
            return
        }

        console.log('Clicked on', bookId)
        const response = await api.set_current_book(bookId)
        const book = await api.fetch_book_simple(bookId)
        setActiveBook(book)
        console.log('Set activeBook to ', book)
        setAppMode(AppModes.EDITOR)
    }

    const handleMouseEnter: MouseEventHandler<HTMLElement> = (evt) => {
        evt.currentTarget.classList.add('highlight')
        setHighLightBookID(evt.currentTarget.dataset.bookId)
    }

    const handleMouseLeave: React.MouseEventHandler<HTMLElement> = (evt) => {
        evt.currentTarget.classList.remove('highlight')
        setHighLightBookID(undefined)
    }

    return (
        <Stack p='md'>
            <SettingsDrawer
                opened={opened}
                close={close}
            />
            <Header height={60}>
                <Group
                    align='center'
                    position='apart'
                >
                    <Title order={1}>Open or create a new book</Title>
                    <Group>
                        <ActionIcon onClick={open}>
                            <IconSettings />
                        </ActionIcon>
                        <Switch
                            checked={colorScheme === 'dark'}
                            onChange={onToggleColorScheme}
                            size='lg'
                            onLabel={
                                <IconMoonStars
                                    color={theme.white}
                                    size='1.25rem'
                                    stroke={1.5}
                                />
                            }
                            offLabel={
                                <IconSun
                                    color={theme.colors.gray[6]}
                                    size='1.25rem'
                                    stroke={1.5}
                                />
                            }
                        />
                    </Group>
                </Group>
            </Header>

            <fieldset>
                <legend>Books</legend>
                <Table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Word count</th>
                            <th>Chapters</th>
                            <th>Updated at</th>
                            <th>Created at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books &&
                            books.map((book: Book) => (
                                <tr
                                    className='bookrow'
                                    data-book-id={book.id}
                                    key={book.id}
                                    onClick={handleBookClick}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <td>{book.title}</td>
                                    <td>{book.words}</td>
                                    <td>{book.chapters && book.chapters.length}</td>
                                    <td>{book.updated_on}</td>
                                    <td>{book.created_on}</td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </fieldset>
            <Title order={5}>Chapter notes</Title>
            <Paper
                shadow='lg'
                p='md'
                withBorder
            >
                {(function quick() {
                    if (highlightBookID === undefined) {
                        return <Text>Hover over a book to see its notes</Text>
                    }
                    if (highlightedBook) {
                        if (highlightedBook.notes.length <= 0) {
                            return <Text>There are no notes</Text>
                        }
                        if (highlightedBook.notes.length > 0) {
                            return <Text>Notes: {highlightedBook.notes}</Text>
                        }
                    }
                    return <Text>Failed to fetch book notes.</Text>
                })()}
            </Paper>
        </Stack>
    )
}
