import { Book, Chapter } from "@src/types";
import {
    QueryClient,
    useMutation,
    useQuery,
    UseQueryResult,
} from "@tanstack/react-query";
import { useCallback } from "react";
import APIBridge from "@src/lib/remote";

export interface ChapterBrokerFunctions {
  clearChapterCache: (
    book_id: Book["id"],
    chapter_id: Chapter["id"],
  ) => Promise<void>;
  create: (
    book_id: Book["id"],
    chapter_title: Chapter["title"],
  ) => Promise<Chapter | undefined>;
  // add: (book: Book) => void
  get: (chapterId: Chapter["id"], stripped: boolean) => Promise<Chapter>;
  fetch: (
    book_id: Book["id"],
    chapter_id: Chapter["id"] | undefined,
    enabled?: boolean,
  ) => UseQueryResult<Chapter, Error>;
  update: (chapter: Chapter) => Promise<Chapter | undefined>;
  reorder: (book_id: Book["id"], from: number, to: number) => void;
}

interface ChapterBrokerProps {
  api: APIBridge;
  queryClient: QueryClient;
}

export const ChapterBroker = ({
    api,
    queryClient,
}: ChapterBrokerProps): ChapterBrokerFunctions => {
    const clearChapterCache = async (
        book_id: Book["id"],
        chapter_id: Chapter["id"],
    ) => {
        await queryClient.invalidateQueries({
            queryKey: ["book", book_id, "index"],
            exact: true,
            refetchType: "active",
        });

        await queryClient.invalidateQueries({
            queryKey: ["book", book_id, "chapter", chapter_id],
            exact: true,
            refetchType: "active",
        });
    };

    const _createChapter = useMutation<Chapter | undefined, Promise<Chapter | undefined>, Partial<Chapter>>({
        mutationFn: (newChapter:Partial<Chapter>) => api.chapter_create(newChapter['book_id'] as string, newChapter as Chapter),
        onSuccess: (response:Chapter|undefined) => {
            if (response) {
                queryClient
                    .invalidateQueries({
                        queryKey: ["book", response.book_id],
                        exact: true,
                        refetchType: "active",
                    })
                    .then();
            }
        },
    });

    const createChapter = (book_id: Book["id"], ChapterTitle: Chapter["title"]) =>
        new Promise<Chapter | undefined>((resolve, reject) => {
            _createChapter.mutate({ book_id, title: ChapterTitle } as Partial<Chapter>,
                {
                    onSuccess: resolve,
                    onError: reject,
                },
            );
        });


    const getChapter: (
    chapterId: Chapter["id"],
    stripped: boolean,
  ) => Promise<Chapter> = useCallback(
      async (chapterId: Chapter["id"], stripped = false) =>
          api.fetch_chapter(chapterId, stripped),
      [api],
  );

    const fetchChapter = useCallback(
        (
            book_id: Book["id"],
            chapter_id: Chapter["id"] | undefined,
            enabled = true,
        ) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
            useQuery<Chapter, Error>({
                queryFn: () => api.fetch_chapter(chapter_id as Chapter["id"]),
                queryKey: ["book", book_id, "chapter", chapter_id],
                enabled,
            }),
        [api],
    );

    const reorderChapter = useCallback(
        async (book_id: Book["id"], from: number, to: number) => {
            await api.reorder_chapter(book_id, from, to);
            await queryClient.invalidateQueries({
                queryKey: ["book", book_id, "index"],
            });
        },
        [api, queryClient],
    );

    const changeChapter = useMutation<Chapter, Error, Chapter>({
        mutationFn: (alterChapter: Chapter) =>
            api.update_chapter(alterChapter.id, alterChapter),
        onSuccess: (chapter) => {
            queryClient
                .invalidateQueries({
                    queryKey: ["book", chapter.book_id, "index"],
                    exact: true,
                    refetchType: "active",
                })
                .then();
            if (chapter) {
                queryClient
                    .invalidateQueries({
                        queryKey: ["book", chapter.book_id, "chapter", chapter.id],
                        exact: true,
                        refetchType: "active",
                    })
                    .then();
            }
        },
    });

    const updateChapter = useCallback<(chapter: Chapter) => Promise<Chapter>>(
        (chapter: Chapter) =>
            new Promise<Chapter>((resolve, reject) => {
                changeChapter.mutate(chapter, { onSuccess: resolve, onError: reject });
            }),
    [changeChapter],
    );

    return {
        clearChapterCache,
        create: createChapter,
        get: getChapter,
        fetch: fetchChapter,
        update: updateChapter,
        reorder: reorderChapter,
    };
};
