import { Updater } from 'use-immer'
import { ActiveElement, Book, Chapter, ChapterIndex, Scene, SceneIndex } from '@src/types'

export class ActiveElementHelper {
    state: ActiveElement
    updater: Updater<ActiveElement>
    constructor(state: ActiveElement, elementUpdater: Updater<ActiveElement>) {
        this.state = state
        this.updater = elementUpdater
    }

    setTypeAndSubtype(
        type_name: 'book' | 'chapter' | undefined,
        type_detail: string | undefined,
        subtype_name: 'scene' | undefined,
        sub_detail: string | undefined
    ) {
        this.updater((draft) => {
            draft.type = type_name
            draft.detail = type_detail
            draft.subtype = subtype_name
            draft.subdetail = sub_detail
        })
    }

    assignType(type_name: 'chapter' | 'book' | undefined, type_detail: string) {
        this.updater((draft) => {
            draft.type = type_name
            draft.detail = type_detail
        })
    }

    assignSubType(subtype_name: 'scene' | undefined, subtype_detail: string) {
        this.updater((draft) => {
            draft.subtype = subtype_name
            draft.subdetail = subtype_detail
        })
    }

    public setActiveScene(chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) {
        this.setActiveSceneById(chapter.id, scene.id)
    }

    public setActiveSceneById(chapter_id: string, scene_id: string) {
        this.setTypeAndSubtype('chapter', chapter_id, 'scene', scene_id)
    }

    public isThisScene(scene: Scene | SceneIndex): boolean {
        return this.isThisSceneById(scene.id)
    }

    public isThisSceneById(scene_id: string): boolean {
        return this.state.subtype === 'scene' && this.state.subdetail === scene_id
    }

    public isThisChapter(chapter: Chapter | ChapterIndex): boolean {
        return this.isThisChapterById(chapter.id)
    }

    public isThisChapterById(chapter_id: string): boolean {
        return this.state.type === 'chapter' && this.state.detail === chapter_id
    }

    public setScene(chapter: Chapter | ChapterIndex, scene: Scene | SceneIndex) {
        this.setSceneById(chapter.id, scene.id)
    }

    public setSceneById(chapter_id: string, scene_id: string) {
        this.setTypeAndSubtype('chapter', chapter_id, 'scene', scene_id)
    }

    public assignScene(scene: SceneIndex) {
        this.assignSceneById(scene.id)
    }

    public assignSceneById(scene_id: string) {
        this.assignSubType('scene', scene_id)
    }

    public setChapter(chapter: Chapter | ChapterIndex) {
        this.setChapterById(chapter.id)
    }

    public setChapterById(chapter_id: string) {
        this.setTypeAndSubtype('chapter', chapter_id, undefined, undefined)
    }

    public assignChapter(chapter: Chapter) {
        this.assignChapterById(chapter.id)
    }

    public assignChapterById(chapter_id: string) {
        this.assignType('chapter', chapter_id)
    }

    public isThisBook(book: Book): boolean {
        return this.isThisBookById(book.id)
    }

    public isThisBookById(book_id: string): boolean {
        return this.state.type === 'book' && this.state.detail === book_id
    }

    public setBook(book: Book) {
        this.setBookById(book.id)
    }

    public setBookById(book_id: string) {
        this.setTypeAndSubtype('book', book_id, undefined, undefined)
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
