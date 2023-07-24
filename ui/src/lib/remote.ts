interface Boundary {
    remote: (method_name: string, ...args: any) => Promise<any>
}

class APIBridge {
    boundary: Boundary

    constructor(boundary: Boundary) {
        this.boundary = boundary
    }

    async info(message: string) {
        return this.boundary.remote('info', message)
    }

    async alert(message: string) {
        return this.boundary.remote('alert', message)
    }

    async list_books(stripped = true) {
        return this.boundary.remote('list_books', stripped)
    }

    async get_current_book(stripped = true) {
        return this.boundary.remote('get_current_book', stripped)
    }

    async set_current_book(book_uid: string) {
        return this.boundary.remote('set_current_book', book_uid)
    }

    async update_book(changed_book: any) {
        return this.boundary.remote('update_book', changed_book)
    }

    async update_book_title(book_uid: string, new_title: string) {
        return this.boundary.remote('update_book_title', book_uid, new_title)
    }

    async fetch_book_simple(book_uid: string) {
        return this.boundary.remote('fetch_book_simple', book_uid)
    }

    async find_source() {
        return this.boundary.remote('find_source')
    }

    async create_source() {
        return this.boundary.remote('create_source')
    }

    async fetch_chapters() {
        return this.boundary.remote('fetch_chapters')
    }

    async fetch_chapter(chapter_id: string, stripped = false) {
        return this.boundary.remote('fetch_chapter', chapter_id, stripped)
    }

    async fetch_chapter_index(chapter_id: string) {
        return this.boundary.remote('fetch_chapter_index', chapter_id)
    }

    async update_chapter(chapter_id: string, chapter_data: any) {
        return this.boundary.remote('update_chapter', chapter_id, chapter_data)
    }

    async reorder_chapter(book_uid: any, from_pos: any, to_pos: any) {
        return this.boundary.remote('reorder_chapter', book_uid, from_pos, to_pos)
    }

    async fetch_stripped_chapters(book_uid: any) {
        return this.boundary.remote('fetch_stripped_chapters', book_uid)
    }

    async create_chapter(new_chapter: any) {
        return this.boundary.remote('create_chapter', new_chapter)
    }

    async save_reordered_chapters(chapters: any) {
        return this.boundary.remote('save_reordered_chapters', chapters)
    }

    async fetch_scene(scene_uid: string) {
        return this.boundary.remote('fetch_scene', scene_uid)
    }

    async fetch_scene_markedup(scene_uid: string) {
        return this.boundary.remote('fetch_scene_markedup', scene_uid)
    }

    async process_scene_markdown(scene_uid: string, raw_text: string) {
        return this.boundary.remote('process_scene_markdown', scene_uid, raw_text)
    }

    async update_scene(scene_uid: string, new_data: any) {
        return this.boundary.remote('update_scene', scene_uid, new_data)
    }

    async create_scene(chapterId: any, title: any, position: any = -1) {
        return this.boundary.remote('create_scene', chapterId, title, position)
    }

    async delete_scene(chapter_uid: string, scene_uid: string) {
        return this.boundary.remote('delete_scene', chapter_uid, scene_uid)
    }

    async reorder_scene(chapterId: string, from_pos: any, to_pos: any) {
        return this.boundary.remote('reorder_scene', chapterId, from_pos, to_pos)
    }

    async reorder_scenes(new_order: any) {
        return this.boundary.remote('reorder_scenes', new_order)
    }

    async attach_scene_status2scene(scene_uid: any, status_uid: any) {
        return this.boundary.remote('attach_scene_status2scene', scene_uid, status_uid)
    }

    async list_all_characters(book_uid: any) {
        return this.boundary.remote('list_all_characters', book_uid)
    }

    async list_characters_by_scene(scene_uid: any) {
        return this.boundary.remote('list_characters_by_scene', scene_uid)
    }

    async search_characters(query: any) {
        return this.boundary.remote('search_characters', query)
    }

    async add_character_to_scene(scene_uid: any, toon_uid: any) {
        return this.boundary.remote('add_character_to_scene', scene_uid, toon_uid)
    }

    async remove_character_from_scene(character_uid: any, scene_uid: any) {
        return this.boundary.remote('remove_character_from_scene', character_uid, scene_uid)
    }

    async create_new_character_to_scene(book_uid: any, scene_uid: any, new_name: string) {
        return this.boundary.remote('create_new_character_to_scene', book_uid, scene_uid, new_name)
    }

    async fetch_character(book_uid: any, character_uid: any) {
        return this.boundary.remote('fetch_character', book_uid, character_uid)
    }

    async update_character(changed_character: any) {
        return this.boundary.remote('update_character', changed_character)
    }

    async delete_character(character_uid: any) {
        return this.boundary.remote('delete_character', character_uid)
    }

    async fetchAllSettings() {
        return this.boundary.remote('fetchAllSettings')
    }

    async getSetting(name: string) {
        return this.boundary.remote('getSetting', name)
    }

    async setSetting(name: string, value: any) {
        return this.boundary.remote('setSetting', name, value)
    }

    async bulkUpdateSettings(changeset: any) {
        return this.boundary.remote('bulkUpdateSettings', changeset)
    }

    async bulkDefaultSettings(changeset: any) {
        return this.boundary.remote('bulkDefaultSettings', changeset)
    }

    async setDefaultSetting(name: any, val: any, type: any) {
        return this.boundary.remote('setDefaultSetting', name, val, type)
    }

    async fetch_all_scene_statuses(book_uid: any) {
        return this.boundary.remote('fetch_all_scene_statuses', book_uid)
    }

    async fetch_scene_status(status_uid: any) {
        return this.boundary.remote('fetch_scene_status', status_uid)
    }

    async create_scene_status(scene_name: string, book_uid: any, scene_uid: any = null) {
        return this.boundary.remote('create_scene_status', scene_name, book_uid, scene_uid)
    }

    async update_scene_status(status_uid: any, changeset: any) {
        return this.boundary.remote('update_scene_status', status_uid, changeset)
    }

    async delete_scene_status(status_uid: any) {
        return this.boundary.remote('delete_scene_status', status_uid)
    }
}

export default APIBridge
