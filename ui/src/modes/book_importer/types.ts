import { DocumentFile } from '@src/types'

export interface InitialSettings {
    book_name: string
    have_default_status: boolean
    default_status: string
    status_color: string
}

export interface BatchSettings {
    documents?: DocumentFile[]
    name_and_status?: InitialSettings
    book_path?: string
}
