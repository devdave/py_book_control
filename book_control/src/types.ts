
export interface BaseElement {
    id: string,
    name: string,
    order: number,
    type: string
}

export interface Location extends BaseElement {
    parent: Location | null
    notes: string
}

export interface Character extends BaseElement {
    notes: string
}


export interface SceneRecord extends BaseElement {
    content: string,
    desc: string,
    locations: Location[],
    characters: Character[],
    notes: string
    words: number
}



export interface Chapter extends BaseElement{
    words: number,
    notes: string,
    scenes: SceneRecord[]

}

export interface Chapters {
    [key: number]:Chapter,
}

export interface BookRecord {
    id: string,
    name: string,
    notes: string
}