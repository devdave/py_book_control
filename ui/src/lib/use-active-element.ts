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
    type SceneIndex
} from '@src/types'
import { useState } from 'react'
import { clone } from 'lodash'

export interface useActiveElementReturn {
    setChapter: (chapter: Chapter | ChapterIndex) => void
    get_subDetail: () => string | undefined
    isThisScene: (scene: Scene | SceneIndex) => boolean
    get_subType: () => ActiveElementSubTypes | undefined
    assignChapter: (chapter: Chapter) => void
    setBook: (book: Book) => void
    setActiveScene: (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => void
    setScene: (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => void
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
    isFocussed: (name: string, id?: string) => boolean | boolean
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

    const setTypeAndSubtype = (
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
    }

    const assignType = (type_name: ActiveElementTypes | undefined, type_detail: string) => {
        setPosition((current) => [clone(state), ...current])
        updater((draft) => {
            draft.type = type_name
            draft.detail = type_detail
        })
    }

    const assignSubType = (subtype_name: ActiveElementSubTypes | undefined, subtype_detail: string) => {
        setPosition((current) => [clone(state), ...current])
        updater((draft) => {
            draft.subtype = subtype_name
            draft.subdetail = subtype_detail
        })
    }

    const pop = (): void => {
        const old_state = position.pop()
        if (old_state) {
            updater(() => old_state)
        }
    }

    const setActiveSceneById = (chapter_id: string, scene_id: string) => {
        setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
    }

    const setActiveScene = (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => {
        setActiveSceneById(chapter.id, scene.id)
    }

    const isThisSceneById = (scene_id: string): boolean =>
        state.subtype === ActiveElementSubTypes.SCENE && state.subdetail === scene_id

    const isThisScene = (scene: Scene | SceneIndex): boolean => isThisSceneById(scene.id)

    const isThisChapterById = (chapter_id: string): boolean =>
        state.type === ActiveElementTypes.CHAPTER && state.detail === chapter_id

    const isThisChapter = (chapter: Chapter | ChapterIndex): boolean => isThisChapterById(chapter.id)

    const setSceneById = (chapter_id: string, scene_id: string) => {
        setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
    }

    const setScene = (chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) => {
        setSceneById(chapter.id, scene.id)
    }

    const assignSceneById = (scene_id: string) => {
        assignSubType(ActiveElementSubTypes.SCENE, scene_id)
    }

    const assignScene = (scene: SceneIndex) => {
        assignSceneById(scene.id)
    }

    const setChapterById = (chapter_id: string) => {
        setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, undefined, undefined)
    }

    const setChapter = (chapter: Chapter | ChapterIndex) => {
        setChapterById(chapter.id)
    }

    const assignChapterById = (chapter_id: string) => {
        assignType(ActiveElementTypes.CHAPTER, chapter_id)
    }

    const assignChapter = (chapter: Chapter) => {
        assignChapterById(chapter.id)
    }

    const isThisBookById = (book_id: string): boolean =>
        state.type === ActiveElementTypes.BOOK && state.detail === book_id

    const isThisBook = (book: Book): boolean => isThisBookById(book.id)

    const setBookById = (book_id: string) => {
        setTypeAndSubtype(ActiveElementTypes.BOOK, book_id, undefined, undefined)
    }

    const setBook = (book: Book) => {
        setBookById(book.id)
    }

    const setCharacterById = (character_id: string) =>
        setTypeAndSubtype(
            ActiveElementTypes.CHARACTERS,
            undefined,
            ActiveElementSubTypes.CHARACTER,
            character_id
        )

    const setCharacter = (character: Character) => setCharacterById(character.id)

    const setFocus = (name: string, id: string | undefined = undefined) => {
        updater((draft) => {
            draft.focus = name
            draft.focus_id = id
        })
    }

    const isFocussed = (name: string, id?: string) => {
        if (id) {
            return state.focus === name && state.focus_id === id
        }
        return state.focus === name
    }

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
        assignType,
        assignScene,
        setChapter,

        assignChapter,
        isThisBook,
        setBook,
        setCharacter,
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
