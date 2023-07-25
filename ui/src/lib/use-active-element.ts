import { useImmer } from 'use-immer'
import {
    type ActiveElement,
    ActiveElementSubTypes,
    ActiveElementTypes,
    type Book,
    type Chapter,
    type ChapterIndex,
    type Character,
    type Scene,
    type SceneIndex,
    UniqueId
} from '@src/types'
import { useCallback, useState } from 'react'
import { clone } from 'lodash'

export interface useActiveElementReturn {
    setChapter: (chapter: Chapter | ChapterIndex) => void
    setChapterById: (chapterId: UniqueId) => void

    get_subDetail: () => string | undefined
    isThisScene: (scene: Scene | SceneIndex) => boolean
    get_subType: () => ActiveElementSubTypes | undefined
    assignChapter: (chapter: Chapter) => void

    setBook: (book: Book) => void
    setBookById: (bookId: UniqueId) => void

    setActiveScene: (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => void

    setScene: (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => void
    setSceneById: (chapterId: UniqueId, sceneId: UniqueId) => void

    assignScene: (scene: SceneIndex) => void
    clear: () => void
    clearSubType: () => void
    assignType: (type_name: ActiveElementTypes | undefined, type_detail: string) => void
    get_focus_id: () => string | number | undefined
    setFocus: (name: string, id?: string | undefined) => void
    isThisChapter: (chapter: Chapter | ChapterIndex) => boolean
    setPosition: (value: ((prevState: ActiveElement[]) => ActiveElement[]) | ActiveElement[]) => void
    get_focus: () => string | undefined
    pop: () => void
    get_type: () => ActiveElementTypes | undefined
    get_detail: () => string | undefined
    isThisBook: (book: Book) => boolean
    position: ActiveElement[]
    setCharacter: (character: Character) => void
    setCharacterById: (characterId: Character['id']) => void
    isFocussed: (name: string, id?: string) => boolean

    setTypeToCharacters: () => void
    isCharactersActive: () => boolean
}

export function useActiveElement(): useActiveElementReturn {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, updater] = useImmer<ActiveElement>({
        type: undefined,
        detail: undefined,
        subtype: undefined,
        subdetail: undefined,
        focus: undefined,
        focus_id: undefined
    })

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [position, setPosition] = useState<ActiveElement[]>([])

    const setTypeAndSubtype = useCallback(
        (
            type_name: ActiveElementTypes | undefined,
            type_detail: string | undefined,
            subtype_name: ActiveElementSubTypes | undefined,
            sub_detail: string | undefined
        ) => {
            setPosition((current) => [clone(state), ...current])

            updater((draft) => {
                draft.type = type_name
                draft.detail = type_detail
                draft.subtype = subtype_name
                draft.subdetail = sub_detail
            })
        },
        [state, updater]
    )

    const assignType = useCallback(
        (type_name: ActiveElementTypes | undefined, type_detail: string) => {
            setPosition((current) => [clone(state), ...current])
            updater((draft) => {
                draft.type = type_name
                draft.detail = type_detail
            })
        },
        [state, updater]
    )

    const assignSubType = useCallback(
        (subtype_name: ActiveElementSubTypes | undefined, subtype_detail: string) => {
            setPosition((current) => [clone(state), ...current])
            updater((draft) => {
                draft.subtype = subtype_name
                draft.subdetail = subtype_detail
            })
        },
        [state, updater]
    )

    const pop = useCallback((): void => {
        const old_state = position.pop()
        if (old_state) {
            updater(() => old_state)
        }
    }, [position, updater])

    const setActiveSceneById = useCallback(
        (chapter_id: string, scene_id: string) => {
            setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
        },
        [setTypeAndSubtype]
    )

    const setActiveScene = useCallback(
        (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => {
            setActiveSceneById(chapter.id, scene.id)
        },
        [setActiveSceneById]
    )

    const isThisSceneById = useCallback(
        (scene_id: string): boolean =>
            state.subtype === ActiveElementSubTypes.SCENE && state.subdetail === scene_id,
        [state.subdetail, state.subtype]
    )

    const isThisScene = useCallback(
        (scene: Scene | SceneIndex): boolean => isThisSceneById(scene.id),
        [isThisSceneById]
    )

    const isThisChapterById = useCallback(
        (chapter_id: string): boolean =>
            state.type === ActiveElementTypes.CHAPTER && state.detail === chapter_id,
        [state.detail, state.type]
    )

    const isThisChapter = useCallback(
        (chapter: Chapter | ChapterIndex): boolean => isThisChapterById(chapter.id),
        [isThisChapterById]
    )

    const setSceneById = useCallback(
        (chapter_id: string, scene_id: string) => {
            setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
        },
        [setTypeAndSubtype]
    )

    const setScene = useCallback(
        (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => {
            setSceneById(chapter.id, scene.id)
        },
        [setSceneById]
    )

    const assignSceneById = useCallback(
        (scene_id: string) => {
            assignSubType(ActiveElementSubTypes.SCENE, scene_id)
        },
        [assignSubType]
    )

    const assignScene = useCallback(
        (scene: SceneIndex) => {
            assignSceneById(scene.id)
        },
        [assignSceneById]
    )

    const setChapterById = useCallback(
        (chapter_id: string) => {
            setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, undefined, undefined)
        },
        [setTypeAndSubtype]
    )

    const setChapter = useCallback(
        (chapter: Chapter | ChapterIndex) => {
            setChapterById(chapter.id)
        },
        [setChapterById]
    )

    const assignChapterById = useCallback(
        (chapter_id: string) => {
            assignType(ActiveElementTypes.CHAPTER, chapter_id)
        },
        [assignType]
    )

    const assignChapter = useCallback(
        (chapter: Chapter) => {
            assignChapterById(chapter.id)
        },
        [assignChapterById]
    )

    const isThisBookById = useCallback(
        (book_id: string): boolean => state.type === ActiveElementTypes.BOOK && state.detail === book_id,
        [state.detail, state.type]
    )

    const isThisBook = useCallback((book: Book): boolean => isThisBookById(book.id), [isThisBookById])

    const setBookById = useCallback(
        (book_id: string) => {
            setTypeAndSubtype(ActiveElementTypes.BOOK, book_id, undefined, undefined)
        },
        [setTypeAndSubtype]
    )

    const setBook = useCallback(
        (book: Book) => {
            setBookById(book.id)
        },
        [setBookById]
    )

    const setCharacterById = useCallback(
        (character_id: string) =>
            setTypeAndSubtype(
                ActiveElementTypes.CHARACTERS,
                undefined,
                ActiveElementSubTypes.CHARACTER,
                character_id
            ),
        [setTypeAndSubtype]
    )

    const setCharacter = useCallback(
        (character: Character) => setCharacterById(character.id),
        [setCharacterById]
    )

    const setTypeToCharacters = useCallback(
        () => setTypeAndSubtype(ActiveElementTypes.CHARACTERS, undefined, undefined, undefined),
        [setTypeAndSubtype]
    )

    const isCharactersActive = useCallback(() => state.type === ActiveElementTypes.CHARACTERS, [state.type])

    const setFocus = useCallback(
        (name: string, id: string | undefined = undefined) => {
            updater((draft) => {
                draft.focus = name
                draft.focus_id = id
            })
        },
        [updater]
    )

    const isFocussed = useCallback(
        (name: string, id?: string) => {
            if (id) {
                return state.focus === name && state.focus_id === id
            }
            return state.focus === name
        },
        [state.focus, state.focus_id]
    )

    const get_type = () => state.type

    const get_detail = () => state.detail

    const get_subType = () => state.subtype

    const get_subDetail = () => state.subdetail

    const get_focus = () => state.focus

    const get_focus_id = () => state.focus_id

    const clearFocus = () => {
        updater((draft) => {
            draft.focus = undefined
            draft.focus_id = undefined
        })
    }

    const clearSubType = () => {
        updater((draft) => {
            draft.subtype = undefined
            draft.subdetail = undefined
        })
    }

    const clearType = () => {
        updater((draft) => {
            draft.type = undefined
            draft.detail = undefined
        })
    }

    const clear = () => {
        clearType()
        clearSubType()
        clearFocus()
    }

    return {
        position,
        setPosition,
        setActiveScene,

        isThisScene,
        isThisChapter,

        setScene,
        setSceneById,

        assignType,
        assignScene,

        setChapter,
        setChapterById,

        assignChapter,
        isThisBook,

        setBook,
        setBookById,

        setCharacter,
        setCharacterById,

        setTypeToCharacters,
        isCharactersActive,

        get_detail,
        get_focus,
        get_focus_id,
        get_type,
        get_subType,
        get_subDetail,
        isFocussed,
        setFocus,
        clear,
        clearSubType,
        pop
    }
}
