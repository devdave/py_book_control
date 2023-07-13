export interface Base {
    [key: string]: any

    id: string
    created_on: string
    updated_on: string
}

export interface Book extends Base {
    title: string
    notes: string
    chapters: Chapter[]
    words: number
}

export interface SceneIndex extends Base {
    chapterId: string
    title: string
    order: number
    words: number
}

export interface Scene extends SceneIndex {
    summary: string
    content: string
    notes: string
    location: string
    characters: string
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
}

export interface ActiveElement {
    type: 'book' | 'chapter' | undefined
    detail: string | undefined
    subtype: 'scene' | undefined
    subdetail: string | undefined
}
