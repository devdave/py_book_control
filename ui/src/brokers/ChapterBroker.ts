import { Book, Chapter } from '@src/types'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'
import { PromptModal } from '@src/widget/input_modal'
import APIBridge from '@src/lib/remote'
import { ShowError } from '@src/widget/ShowErrorNotification'

export interface ChapterBrokerFunctions {
    create: (book_id: Book['id'], chapter_title: Chapter['title']) => Promise<Chapter | undefined>
    // add: (book: Book) => void
    get: (chapterId: Chapter['id'], stripped: boolean) => Promise<Chapter>
    fetch: (
        book_id: Book['id'],
        chapter_id: Chapter['id'] | undefined,
        enabled?: boolean
    ) => UseQueryResult<Chapter, Error>
    update: (chapter: Chapter) => Promise<Chapter | undefined>
    reorder: (book_id: Book['id'], from: number, to: number) => void
}

interface ChapterBrokerProps {
    api: APIBridge

    queryClient: QueryClient
}

export const ChapterBroker = ({
    api,

    queryClient
}: ChapterBrokerProps): ChapterBrokerFunctions => {
    const _createChapter = useMutation<Chapter | undefined, Error, Partial<Chapter>>({
        mutationFn: (newChapter: object) => api.create_chapter(newChapter),
        onSuccess: (response) => {
            console.log(response)
            if (response) {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', response.book_id, 'index'],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
            }
        }
    })

    const createChapter = (book_id: Book['id'], ChapterTitle: Chapter['title']) =>
        new Promise<Chapter | undefined>((resolve, reject) => {
            _createChapter.mutate({ book_id, title: ChapterTitle } as Partial<Chapter>, {
                onSuccess: resolve,
                onError: reject
            })
        })

    const addChapter = useCallback(
        async (book: Book) => {
            console.log('addChapter is !DEPRECATED!')
            const chapterTitle: string = await PromptModal('New chapter title')
            if (chapterTitle.trim().length <= 2) {
                ShowError('Error', "Chapter's must have a title longer than 2 characters.")
                return undefined
            }
            return _createChapter.mutate({ book_id: book.id, title: chapterTitle } as Partial<Chapter>)
        },
        [_createChapter]
    )

    const getChapter: (chapterId: Chapter['id'], stripped: boolean) => Promise<Chapter> = useCallback(
        async (chapterId: Chapter['id'], stripped = false) => api.fetch_chapter(chapterId, stripped),
        [api]
    )

    const fetchChapter = useCallback(
        (book_id: Book['id'], chapter_id: Chapter['id'] | undefined, enabled = true) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Chapter, Error>({
                queryFn: () => api.fetch_chapter(chapter_id),
                queryKey: ['book', book_id, 'chapter', chapter_id],
                enabled
            }),
        [api]
    )

    const reorderChapter = useCallback(
        async (book_id: Book['id'], from: number, to: number) => {
            await api.reorder_chapter(book_id, from, to)
            await queryClient.invalidateQueries({
                queryKey: ['book', book_id, 'index']
            })
        },
        [api, queryClient]
    )

    const changeChapter = useMutation<Chapter, Error, Chapter>({
        mutationFn: (alterChapter: Chapter) => api.update_chapter(alterChapter.id, alterChapter),
        onSuccess: (chapter) => {
            queryClient
                .invalidateQueries({
                    queryKey: ['book', chapter.book_id, 'index'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
            if (chapter) {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', chapter.book_id, 'chapter', chapter.id],
                        exact: true,
                        refetchType: 'active'
                    })
                    .then()
            }
        }
    })

    const updateChapter = useCallback<(chapter: Chapter) => Promise<Chapter>>(
        (chapter: Chapter) =>
            new Promise<Chapter>((resolve, reject) => {
                changeChapter.mutate(chapter, { onSuccess: resolve, onError: reject })
            }),
        [changeChapter]
    )

    return {
        create: createChapter,
        // add: addChapter,
        get: getChapter,
        fetch: fetchChapter,
        update: updateChapter,
        reorder: reorderChapter
    }
}
