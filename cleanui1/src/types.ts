
interface Chapter {
    id:string
    order:number
    name:string
    notes:string
    scenes:Scene[]
}

interface Scene {
    id:string
    chapterId:string
    order:number
    name:string
    content:string
    notes:string
}