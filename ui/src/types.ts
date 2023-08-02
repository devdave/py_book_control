export type UniqueId = string
export type UID = UniqueId

export type Setter<TTarget> = (val: TTarget | undefined | ((update: TTarget) => void)) => void
export type CharacterLocation = [string, string, string, string]

export type common_setting_type = number | string | boolean | undefined

export interface Setting {
    [key: string]: common_setting_type
    id: UniqueId
    name: string
    type: 'boolean' | 'string' | 'number'
    value: common_setting_type
}

export interface Base {
    id: UID
    created_on?: string
    updated_on?: string
}

export interface SceneStatus extends Base {
    name: string
    scene?: Scene
    book_id?: UniqueId
    color: string
}

export interface Book extends Base {
    title: string | undefined
    notes: string
    operation_type: 'managed' | 'imported' | 'oversight'
    chapters: Chapter[]
    words: number
}

export interface SceneIndex extends Base {
    chapterId: UID
    title: string
    order: number
    words: number
    status: SceneStatus
}

export interface Scene extends SceneIndex {
    [key: string]: string | Character[] | undefined | number | SceneStatus
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

export interface Character extends Base {
    name: string
    notes: string
    book_id: UID
    scene_count?: number
    locations: CharacterLocation[]
}

export enum AppModes {
    EDITOR = 'editor',
    OUTLINE = 'outline',
    STATS = 'stats',
    MANIFEST = 'manifest',
    IMPORTER = 'importer'
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
    CHARACTERS = 'charactrs',
    STATUSES = 'statuses'
}

export enum ActiveElementSubTypes {
    SCENE = 'scene',
    CHARACTER = 'character'
}

export enum ActiveElementFocusTypes {
    NOTES = 'notes',
    SUMMARY = 'summary'
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
    defaultSceneStatus: string
    lastImportedPath: string
}

export interface attachSceneStatus2SceneProps {
    scene_uid?: Scene['id']
    status_uid?: SceneStatus['id']
    status_name?: string
    book_id: Book['id']
}

export interface DocumentFile {
    name: string
    path: string
    created_date: string
    modified_last: string
    size: number
    words?: number
}

export interface ImportedBook {
    path: string
    dir_name: string
    documents: DocumentFile[]
}
