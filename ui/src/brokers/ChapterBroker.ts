import { Book, Chapter, UID } from '@src/types'
import { QueryClient, useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'
import { PromptModal } from '@src/widget/input_modal'
import APIBridge from '@src/lib/remote'

export interface ChapterBrokerFunctions {
    create: (book_id: Book['id'], chapter_title: Chapter['title']) => void
    add: (book: Book) => void
    get: (chapterId: Chapter['id']) => Promise<Chapter>
    fetch: (book_id: Book['id'], chapter_id: Chapter['id']) => UseQueryResult<Chapter, Error>
    update: (chapter: Chapter) => void
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
    const _createChapter = useMutation<Chapter, Error, Partial<Chapter>>({
        mutationFn: (newChapter: object) => api.create_chapter(newChapter),
        onSuccess: (response, newChapter) => {
            console.log(response)
            queryClient.invalidateQueries({ queryKey: ['book', newChapter.book_id] }).then()
        }
    })

    const createChapter = (book_id: Book['id'], ChapterTitle: Chapter['title']) => {
        _createChapter.mutate({ book_id, title: ChapterTitle } as Partial<Chapter>)
    }

    const addChapter = useCallback(
        async (book: Book) => {
            const chapterTitle: string = await PromptModal('New chapter title')
            if (chapterTitle.trim().length <= 2) {
                alert("Chapter's must have a title longer than 2 characters.")
                return
            }
            _createChapter.mutate({ book_id: book.id, title: chapterTitle } as Partial<Chapter>)
        },
        [_createChapter]
    )

    const getChapter: (chapterId: Chapter['id']) => Promise<Chapter> = useCallback(
        async (chapterId: string) => api.fetch_chapter(chapterId),
        [api]
    )

    const fetchChapter = useCallback(
        (book_id: UID, chapter_id: UID) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Chapter, Error>({
                queryFn: () => api.fetch_chapter(chapter_id),
                queryKey: ['book', book_id, 'chapter', chapter_id]
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
                    queryKey: ['book', chapter.book_id, 'index']
                })
                .then()
            if (chapter) {
                queryClient
                    .invalidateQueries({
                        queryKey: ['book', chapter.book_id, 'chapter', chapter.id]
                    })
                    .then()
            }
        }
    })

    const updateChapter = useCallback<(chapter: Chapter) => Promise<void>>(
        async (chapter: Chapter) => {
            await changeChapter.mutate(chapter)
        },
        [changeChapter]
    )

    return {
        create: createChapter,
        add: addChapter,
        get: getChapter,
        fetch: fetchChapter,
        update: updateChapter,
        reorder: reorderChapter
    }
}
