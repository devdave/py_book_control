import { useImmer } from 'use-immer'
import {
    type ActiveElement,
    ActiveElementFocusTypes,
    ActiveElementSubTypes,
    ActiveElementTypes,
    type Book,
    type Chapter,
    type ChapterIndex,
    type Character,
    type Scene,
    type SceneIndex,
    type UniqueId
} from '@src/types'
import { useCallback, useState } from 'react'
import { clone } from 'lodash'

export interface useActiveElementReturn {
    pop: () => void
    length: () => number
    push: () => void
    trail: () => ActiveElement[]

    setChapter: (chapter: Chapter | ChapterIndex) => void
    setChapterById: (chapterId: UniqueId) => void

    get_subDetail: () => string | undefined

    get_subType: () => ActiveElementSubTypes | undefined
    subTypeIs: (subtype: ActiveElementSubTypes) => boolean

    assignChapter: (chapter: Chapter) => void

    setBook: (book: Book) => void
    setBookById: (bookId: UniqueId) => void

    setActiveScene: (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => void
    isThisScene: (scene: Scene | SceneIndex) => boolean
    setScene: (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => void
    setSceneById: (chapterId: UniqueId, sceneId: UniqueId) => void
    assignScene: (scene: SceneIndex) => void

    clear: () => void
    clearSubType: () => void

    assignType: (type_name: ActiveElementTypes | undefined, type_detail: string) => void
    assignSubType: (subtype_name: ActiveElementSubTypes | undefined, subtype_detail: string) => void

    get_type: () => ActiveElementTypes | undefined
    setType: (typeName: ActiveElementTypes) => void
    typeIs: (typeName: ActiveElementTypes) => boolean

    get_focus_id: () => string | number | undefined
    setFocus: (name: string, id?: string | undefined) => void
    isThisChapter: (chapter: Chapter | ChapterIndex) => boolean

    get_detail: () => string | undefined
    isThisBook: (book: Book) => boolean

    setCharacter: (character: Character) => void
    setCharacterById: (characterId: Character['id']) => void
    characterIsSet(): boolean

    get_focus: () => string | undefined
    assignFocus: (name: ActiveElementFocusTypes, id?: string) => void
    isFocussed: (name: ActiveElementFocusTypes, id?: string) => boolean

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
    const [history, setHistory] = useState<ActiveElement[]>([])

    const pop = useCallback((): void => {
        const old_state = history.pop()
        if (old_state) {
            updater(() => old_state)
        }
    }, [history, updater])

    const push = useCallback(() => {
        setHistory((current) => [clone(state), ...current])
        if (history.length > 5) {
            history.pop()
        }
    }, [history, state])

    const length = () => history.length

    const trail = () => clone(history)

    const setTypeAndSubtype = useCallback(
        (
            type_name: ActiveElementTypes | undefined,
            type_detail: string | undefined,
            subtype_name: ActiveElementSubTypes | undefined,
            sub_detail: string | undefined
        ) => {
            push()
            updater((draft) => {
                draft.type = type_name
                draft.detail = type_detail
                draft.subtype = subtype_name
                draft.subdetail = sub_detail
            })
        },
        [push, updater]
    )

    const assignType = useCallback(
        (type_name: ActiveElementTypes | undefined, type_detail: string) => {
            setHistory((current) => [clone(state), ...current])
            updater((draft) => {
                draft.type = type_name
                draft.detail = type_detail
            })
        },
        [state, updater]
    )

    const assignSubType = useCallback(
        (subtype_name: ActiveElementSubTypes | undefined, subtype_detail: string) => {
            setHistory((current) => [clone(state), ...current])
            updater((draft) => {
                draft.subtype = subtype_name
                draft.subdetail = subtype_detail
            })
        },
        [state, updater]
    )

    const clearFocus = useCallback(() => {
        updater((draft) => {
            draft.focus = undefined
            draft.focus_id = undefined
        })
    }, [updater])

    const clearSubType = useCallback(() => {
        updater((draft) => {
            draft.subtype = undefined
            draft.subdetail = undefined
        })
    }, [updater])

    const clearType = useCallback(() => {
        updater((draft) => {
            draft.type = undefined
            draft.detail = undefined
        })
    }, [updater])

    const clear = useCallback(() => {
        clearType()
        clearSubType()
        clearFocus()
    }, [clearFocus, clearSubType, clearType])

    const get_type = () => state.type

    const setType = (typeName: ActiveElementTypes) => {
        clear()
        setTypeAndSubtype(typeName, undefined, undefined, undefined)
    }
    const typeIs = (typeName: ActiveElementTypes) => get_type() === typeName

    const get_detail = () => state.detail

    const get_subType = useCallback(() => state.subtype, [state])

    const get_subDetail = () => state.subdetail

    const get_focus = () => state.focus

    const get_focus_id = () => state.focus_id

    const subTypeIs = useCallback(
        (subtype: ActiveElementSubTypes) => get_subType() === subtype,
        [get_subType]
    )

    const setActiveSceneById = useCallback(
        (chapter_id: string, scene_id: string) => {
            clear()
            setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
        },
        [setTypeAndSubtype, clear]
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
            clear()
            setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
        },
        [setTypeAndSubtype, clear]
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
            clear()
            setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, undefined, undefined)
        },
        [setTypeAndSubtype, clear]
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

    const characterIsSet = () => get_subType() === 'character' && get_subDetail() !== undefined

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

    const assignFocus = useCallback(
        (name: ActiveElementFocusTypes, id?: string) => {
            updater((draft) => {
                draft.focus = name
                draft.focus_id = id
            })
        },
        [updater]
    )
    const isFocussed = useCallback(
        (name: ActiveElementFocusTypes, id?: string) => {
            if (id) {
                return state.focus === name && state.focus_id === id
            }
            return state.focus === name
        },
        [state.focus, state.focus_id]
    )

    return {
        setActiveScene,

        isThisScene,
        isThisChapter,

        setScene,
        setSceneById,

        assignType,
        assignSubType,
        assignScene,

        setChapter,
        setChapterById,

        assignChapter,

        isThisBook,
        setBook,
        setBookById,

        setCharacter,
        setCharacterById,
        characterIsSet,

        setTypeToCharacters,
        isCharactersActive,

        isFocussed,
        assignFocus,
        setFocus,
        get_focus,
        get_focus_id,

        get_detail,

        get_type,
        setType,
        typeIs,

        get_subType,
        subTypeIs,

        get_subDetail,

        clear,
        clearSubType,

        pop,
        push,
        length,
        trail
    }
}
