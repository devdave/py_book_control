import APIBridge from '@src/lib/remote'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { Book, UniqueId } from '@src/types'
import { useCallback } from 'react'
import { Updater } from 'use-immer'

export interface BookBrokerReturnFunctions {
    createManaged: (book_name: string) => Promise<Book>
    update: (book: Partial<Book>) => Promise<Book>
    fetch: (book_id: Book['id']) => UseQueryResult<Book, Error>
    fetchAll: () => UseQueryResult<Book[], Error>
}

interface BookBrokerProps {
    api: APIBridge
    activeBook: Book
    setActiveBook: Updater<Book>
    queryClient: QueryClient
}

export const BookBroker = ({
    api,
    activeBook,
    setActiveBook,
    queryClient
}: BookBrokerProps): BookBrokerReturnFunctions => {
    /**
     * Book api handlers
     *
     *
     */
    const createManagedBook = async (book_name: string): Promise<Book> => {
        const newBook = await api.create_managed_book(book_name)
        await queryClient.invalidateQueries({ queryKey: ['books', 'index'] })
        return newBook
    }

    const _changeBook = useMutation<Book, Error, Book>((book) => api.update_book(book), {
        onSuccess: (updated: Book) => {
            queryClient.invalidateQueries(['book', updated.id, 'index']).then()
            if (updated.id === activeBook.id) {
                setActiveBook((draft) => {
                    draft.title = updated.title
                    draft.notes = updated.notes
                    draft.updated_on = updated.updated_on
                })
            }
        }
    })

    const updateBook: (book: Partial<Book>) => Promise<Book> = useCallback(
        (book: Partial<Book>) =>
            new Promise((resolve, reject) => {
                if (book.id) {
                    _changeBook.mutate(book as Book, { onSuccess: resolve, onError: reject })
                }
                reject(Error('Cannot update book without Id'))
            }),
        [_changeBook]
    )

    const fetchStrippedBooks = useCallback(
        () =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Book[], Error>({
                queryFn: () => api.list_books(true),
                queryKey: ['books', 'index']
            }),
        [api]
    )

    const fetchStrippedBook = useCallback(
        (book_id: UniqueId) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Book, Error>({
                enabled: book_id !== undefined,
                staleTime: 10000,
                queryFn: () => api.fetch_book_simple(book_id),
                queryKey: ['book', book_id]
            }),
        [api]
    )

    return {
        createManaged: createManagedBook,
        update: updateBook,
        fetch: fetchStrippedBook,
        fetchAll: fetchStrippedBooks
    }
}
