import {
    ActionIcon,
    AppShell,
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

import { IconMoonStars, IconPlus, IconSettings, IconSun, IconX } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { SettingsDrawer } from '@src/common/SettingsDrawer'
import './manifest.css'
import { BookNameModal } from '@src/modes/manifest/BookNameModal'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { ConfirmModal } from '@src/widget/ConfirmModal'

const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    }
}))

export const Manifest = () => {
    const { api, setActiveBook, setAppMode, bookBroker } = useAppContext()

    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const [highlightBookID, setHighLightBookID] = useState<UID | undefined>()

    const [opened, { open, close }] = useDisclosure(false)

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const { data: books, isLoading: booksAreLoading } = bookBroker.fetchAll()

    const { data: highlightedBook } = bookBroker.fetch(highlightBookID as UID)

    if (booksAreLoading) {
        return (
            <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </>
        )
    }

    const doMakeNewbook = async () => {
        const newName = await BookNameModal()

        if (!newName || newName.length <= 2) {
            ShowError('Invalid', 'A book name needs to be at least 3 characters long.')
            return
        }

        const newBook = await bookBroker.createManaged(newName)
        await api.set_current_book(newBook.id)
        setActiveBook(newBook)
        setAppMode(AppModes.EDITOR)
    }

    const handleClickedImport = () => {
        setAppMode(AppModes.IMPORTER)
    }

    const handleDeleteBook = async (book_id: Book['id']) => {
        ConfirmModal('Delete', 'Are you sure you want to delete this?').then((response) => {
            alert(`I got ${response}`)
        })
    }

    const handleBookClick: MouseEventHandler<HTMLElement> = async (evt) => {
        const { bookId } = evt.currentTarget.dataset
        if (bookId === undefined) {
            console.error('Got a bad bookId for ', evt)
            return
        }

        console.log('Clicked on', bookId)
        await api.set_current_book(bookId)
        const book = await api.fetch_book_simple(bookId)
        setActiveBook(book)
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

    const header = (
        <Header height={60}>
            <SettingsDrawer
                opened={opened}
                close={close}
            />
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
    )

    return (
        <AppShell header={header}>
            <Stack p='md'>
                <fieldset>
                    <legend>New book options</legend>
                    <Group
                        position='left'
                        align='start'
                    >
                        <Paper
                            className='shadowBoxes'
                            shadow='xl'
                            withBorder
                            p='md'
                            onClick={doMakeNewbook}
                        >
                            <IconPlus className='plusBox' />
                            <Title order={5}>New book</Title>
                            <Text size='sm'>Create a completely new book</Text>
                        </Paper>
                        <Paper
                            className='shadowBoxes'
                            shadow='xl'
                            withBorder
                            p='md'
                            onClick={handleClickedImport}
                        >
                            <IconPlus className='plusBox' />
                            <Title order={5}>Import a book</Title>
                            <Text size='sm'>Copy a formatted book in another format into the app.</Text>
                        </Paper>
                        <Paper
                            className='shadowBoxes'
                            shadow='xl'
                            withBorder
                            p='md'
                        >
                            <IconPlus className='plusBox' />
                            <Title order={5}>Annotate a book</Title>
                            <Text>
                                Shadow copy an external project. Intended for adding markup but leaving the
                                source material alone.
                            </Text>
                        </Paper>
                    </Group>
                </fieldset>
                <fieldset>
                    <legend>Books</legend>
                    <Table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Word count</th>
                                <th>Type</th>
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
                                        key={book.id}
                                        data-book-id={book.id}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <td
                                            data-book-id={book.id}
                                            onClick={handleBookClick}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {book.title}
                                        </td>
                                        <td>{book.words}</td>
                                        <td>{book.operation_type}</td>
                                        <td>{book.chapters && book.chapters.length}</td>
                                        <td>{book.updated_on}</td>
                                        <td>{book.created_on}</td>
                                        <td>
                                            <ActionIcon onClick={() => handleDeleteBook(book.id)}>
                                                <IconX />
                                            </ActionIcon>
                                        </td>
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
        </AppShell>
    )
}
