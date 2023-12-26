import APIBridge from '@src/lib/remote'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { Book, UniqueId } from '@src/types'
import { useCallback } from 'react'


export interface BookBrokerReturnFunctions {
    createManaged: (book_name: string) => Promise<Book>
    update: (book: Partial<Book>) => Promise<Book>
    fetch: (book_id: Book['id']) => UseQueryResult<Book, Error>
    fetchAll: () => UseQueryResult<Book[], Error>
    clearCache: () => Promise<void>
    delete: (book_id: Book['id']) => Promise<void>
}

interface BookBrokerProps {
    api: APIBridge
    queryClient: QueryClient
}

export const BookBroker = ({
    api,
    queryClient
}: BookBrokerProps): BookBrokerReturnFunctions => {
    /**
     * Book api handlers
     *
     *
     */
    const clearCache = async (): Promise<void> => {
        await queryClient.invalidateQueries({
            queryKey: ['books', 'index'],
            refetchType: 'active'
        })
    }

    const clearBookId = async (book_id: Book['id']): Promise<void> => {
        await clearCache()
        await queryClient.invalidateQueries({queryKey: ["book", book_id], refetchType: "active"})
    }

    const createManagedBook = async (book_name: string): Promise<Book> => {
        const newBook = await api.create_managed_book(book_name)
        await clearCache()
        return newBook
    }

    const _changeBook = useMutation<Book, Error, Book>(
        { mutationFn: (book) => api.book_update(book['id'], book),
            onSuccess: (updated: Book) => {
                clearBookId(updated.id).then()
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

    const deleteBook = useCallback(
        async (book_id: Book['id']) => {
            await api.book_delete(book_id)
            await clearBookId(book_id)
        },
        [api, clearCache]
    )

    return {
        createManaged: createManagedBook,
        update: updateBook,
        fetch: fetchStrippedBook,
        fetchAll: fetchStrippedBooks,
        clearCache,
        delete: deleteBook
    }
}
