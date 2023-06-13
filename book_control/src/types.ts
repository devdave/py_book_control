
export interface BaseElement {
    id: string,
    name: string,
    order: number
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
    scenes: SceneRecord[]
}

export interface TargetedElement {
    id: string,
    name: string,
    words: number,
    targetType: string,
    targetId: string,
    children: TargetedElement[]
}