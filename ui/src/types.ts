export type UID = string

export interface Base {
    [key: string]: any

    id: UID
    created_on?: string
    updated_on?: string
}

export interface Book extends Base {
    title: string
    notes: string
    chapters: Chapter[]
    words: number
}

export interface SceneIndex extends Base {
    chapterId: UID
    title: string
    order: number
    words: number
}

export interface Scene extends SceneIndex {
    summary: string
    content: string
    notes: string
    location: string
    characters: Character[]
}

export interface ChapterIndex extends Base {
    title: string
    scenes: SceneIndex[]
    order: number
    words: number
}

export interface Chapter extends ChapterIndex {
    title: string
    summary: string
    notes: string
    scenes: Scene[]
    order: number
    words: number
}

type CharacterLocation = [string, string, string, string]

export interface Character extends Base {
    name: string
    notes: string
    book_id: UID
    scene_count?: number
    locations?: CharacterLocation[]
}

export enum AppModes {
    EDITOR = 'editor',
    OUTLINE = 'outline',
    STATS = 'stats',
    MANIFEST = 'manifest'
}

export enum EditModes {
    LIST = 'list',
    FLOW = 'flow'
}

export interface SplitResponse {
    content: string
    split_content: string
    title: string
    split_title: string
}

export interface Font {
    name: string
    size: number
    weight: string
    height: string
}

export enum ActiveElementTypes {
    BOOK = 'book',
    CHAPTER = 'chapter',
    CHARACTERS = 'characters'
}

export enum ActiveElementSubTypes {
    SCENE = 'scene',
    CHARACTER = 'character'
}

export interface ActiveElement {
    type: ActiveElementTypes | undefined
    detail: string | undefined
    subtype: ActiveElementSubTypes | undefined
    subdetail: string | undefined
}

export type defaultSetterType<TTValues> = [keyof TTValues, TTValues[keyof TTValues], string]
// export type MutationFunction<settingsSetterType<TTValues> = { name: keyof TTValues; value: TTValues[keyof TTValues] }>

export interface AppSettingValues {
    [key: string]: string | number | boolean
    fontName: string
    fontWeight: number
    fontSize: number
    lineHeight: number
    debounceTime: number
    dontAskOnSplit: boolean
    dontAskOnClear2Delete: boolean
}
