
export interface OrderableElement {
    id: string,
    name: string,
    order: number
}

export interface Location extends OrderableElement {
    parent: Location | null
}

export interface Character extends OrderableElement {
    notes: string
}


export interface Scene extends OrderableElement {
    content: string,
    desc: string,
    locations: Location[],
    characters: Character[],
    notes: string
}



export interface Chapter extends OrderableElement{
    words: number,
    scenes: Scene[]
}