export type UniqueId = string
export type UID = UniqueId

export type Setter<TTarget> = (val: TTarget | undefined | ((update: TTarget) => void)) => void

export type common_setting_type = number | string | boolean | undefined

export interface Setting {
    [key: string]: common_setting_type
    id: UniqueId
    name: string
    type: 'boolean' | 'string' | 'number'
    value: common_setting_type
}

export interface Base {
    [key: string]:
        | common_setting_type
        | Chapter[]
        | ChapterIndex[]
        | SceneIndex[]
        | Scene[]
        | Scene
        | Character[]
        | Location

    id: UID
    created_on?: string
    updated_on?: string
}

export interface SceneStatus extends Base {
    name: string
    scene?: Scene
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
    status: SceneStatus['name']
    status_id?: UID
}

export interface Scene extends SceneIndex {
    summary: string
    content: string
    notes: string
    location: string
    characters: Character[]
}

export interface ChapterIndex extends Base {
    book_id: Book['id']
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
    location?: string
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
    focus: string | undefined
    focus_id: string | number | undefined
}

export type defaultSetterType<TTValues> = [keyof TTValues, TTValues[keyof TTValues], string]
// export type MutationFunction<settingsSetterType<TTValues> = { name: keyof TTValues; value: TTValues[keyof TTValues] }>

export interface AppSettingValues {
    [key: string]: common_setting_type
    fontName: string
    fontWeight: number
    fontSize: number
    lineHeight: number
    debounceTime: number
    dontAskOnSplit: boolean
    dontAskOnClear2Delete: boolean
}

export interface attachSceneStatus2SceneProps {
    scene_uid?: Scene['id']
    status_uid?: SceneStatus['id']
    status_name?: string
    book_id: Book['id']
}
