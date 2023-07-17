import { Updater } from 'use-immer'
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

export class ActiveElementHelper {
    state: ActiveElement
    updater: Updater<ActiveElement>
    constructor(state: ActiveElement, elementUpdater: Updater<ActiveElement>) {
        this.state = state
        this.updater = elementUpdater
    }

    setTypeAndSubtype(
        type_name: ActiveElementTypes | undefined,
        type_detail: string | undefined,
        subtype_name: ActiveElementSubTypes | undefined,
        sub_detail: string | undefined
    ) {
        this.updater((draft) => {
            draft.type = type_name
            draft.detail = type_detail
            draft.subtype = subtype_name
            draft.subdetail = sub_detail
        })
    }

    assignType(type_name: ActiveElementTypes | undefined, type_detail: string) {
        this.updater((draft) => {
            draft.type = type_name
            draft.detail = type_detail
        })
    }

    assignSubType(subtype_name: ActiveElementSubTypes | undefined, subtype_detail: string) {
        this.updater((draft) => {
            draft.subtype = subtype_name
            draft.subdetail = subtype_detail
        })
    }

    public setActiveScene(chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) {
        this.setActiveSceneById(chapter.id, scene.id)
    }

    public setActiveSceneById(chapter_id: string, scene_id: string) {
        this.setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
    }

    public isThisScene(scene: Scene | SceneIndex): boolean {
        return this.isThisSceneById(scene.id)
    }

    public isThisSceneById(scene_id: string): boolean {
        return this.state.subtype === ActiveElementSubTypes.SCENE && this.state.subdetail === scene_id
    }

    public isThisChapter(chapter: Chapter | ChapterIndex): boolean {
        return this.isThisChapterById(chapter.id)
    }

    public isThisChapterById(chapter_id: string): boolean {
        return this.state.type === ActiveElementTypes.CHAPTER && this.state.detail === chapter_id
    }

    public setScene(chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) {
        this.setSceneById(chapter.id, scene.id)
    }

    public setSceneById(chapter_id: string, scene_id: string) {
        this.setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, ActiveElementSubTypes.SCENE, scene_id)
    }

    public assignScene(scene: SceneIndex) {
        this.assignSceneById(scene.id)
    }

    public assignSceneById(scene_id: string) {
        this.assignSubType(ActiveElementSubTypes.SCENE, scene_id)
    }

    public setChapter(chapter: Chapter | ChapterIndex) {
        this.setChapterById(chapter.id)
    }

    public setChapterById(chapter_id: string) {
        this.setTypeAndSubtype(ActiveElementTypes.CHAPTER, chapter_id, undefined, undefined)
    }

    public assignChapter(chapter: Chapter) {
        this.assignChapterById(chapter.id)
    }

    public assignChapterById(chapter_id: string) {
        this.assignType(ActiveElementTypes.CHAPTER, chapter_id)
    }

    public isThisBook(book: Book): boolean {
        return this.isThisBookById(book.id)
    }

    public isThisBookById(book_id: string): boolean {
        return this.state.type === ActiveElementTypes.BOOK && this.state.detail === book_id
    }

    public setBook(book: Book) {
        this.setBookById(book.id)
    }

    public setBookById(book_id: string) {
        this.setTypeAndSubtype(ActiveElementTypes.BOOK, book_id, undefined, undefined)
    }

    public setCharacter(character: Character) {
        return this.setCharacterById(character.id)
    }

    public setCharacterById(character_id: string) {
        return this.assignSubType(ActiveElementSubTypes.CHARACTER, character_id)
    }

    public get type() {
        return this.state.type
    }

    public get detail() {
        return this.state.detail
    }

    public get subType() {
        return this.state.subtype
    }

    public get subDetail() {
        return this.state.subdetail
    }

    clearSubType() {
        this.updater((draft) => {
            draft.subtype = undefined
            draft.subdetail = undefined
        })
    }

    clearType() {
        this.updater((draft) => {
            draft.type = undefined
            draft.detail = undefined
        })
    }

    clear() {
        this.updater((draft) => {
            draft.type = undefined
            draft.detail = undefined
            draft.subtype = undefined
            draft.subdetail = undefined
        })
    }
}
