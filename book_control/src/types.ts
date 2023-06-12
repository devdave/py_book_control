
export interface BaseElement {
    id: string,
    name: string,
    order: number
}

export interface Location extends BaseElement {
    parent: Location | null
}

export interface Character extends BaseElement {
    notes: string
}


export interface Scene extends BaseElement {
    content: string,
    desc: string,
    locations: Location[],
    characters: Character[],
    notes: string
    words: number
}



export interface Chapter extends BaseElement{
    words: number,
    scenes: Scene[]
}

export interface TargetedElement {
    name: string,
    words: number,
    targetType: string,
    targetId: string,
    children: TargetedElement[]
}