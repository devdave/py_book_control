import {
    type Book, 
    type Chapter, 
    type Character, 
    type Scene, 
    type Setting, 
    type common_setting_type, 
    type UniqueId, 
    type SceneStatus,
    type DocumentFile,
    type ImportedBook
    } from '@src/types'

interface Boundary {
    remote: (method_name:string, ...args:any)=> Promise<any>
}

class APIBridge {
    boundary:Boundary

    constructor(boundary:Boundary) {
        this.boundary = boundary
    }


    async info(message:string) {
        return this.boundary.remote('info', message);
    }

    async alert(message:string) {
        return this.boundary.remote('alert', message);
    }

    async list_books(stripped:boolean = true):Promise<Book[]> {
        return this.boundary.remote('list_books', stripped);
    }

    async get_current_book(stripped:boolean = true):Promise<Book | undefined> {
        return this.boundary.remote('get_current_book', stripped);
    }

    async set_current_book(book_uid:UniqueId):Promise<Book> {
        return this.boundary.remote('set_current_book', book_uid);
    }

    async update_book(changed_book:Book):Promise<Book> {
        return this.boundary.remote('update_book', changed_book);
    }

    async update_book_title(book_uid:UniqueId, new_title:string):Promise<Book> {
        return this.boundary.remote('update_book_title', book_uid, new_title);
    }

    async fetch_book_simple(book_uid:UniqueId):Promise<Book> {
        return this.boundary.remote('fetch_book_simple', book_uid);
    }

    async create_managed_book(book_name:string):Promise<Book> {
        return this.boundary.remote('create_managed_book', book_name);
    }

    async find_source() {
        return this.boundary.remote('find_source', );
    }

    async create_source() {
        return this.boundary.remote('create_source', );
    }

    async fetch_chapters():Promise<Chapter[]> {
        return this.boundary.remote('fetch_chapters', );
    }

    async fetch_chapter(chapter_id:UniqueId, stripped:boolean = false):Promise<Chapter> {
        return this.boundary.remote('fetch_chapter', chapter_id, stripped);
    }

    async fetch_chapter_index(chapter_id:UniqueId) {
        return this.boundary.remote('fetch_chapter_index', chapter_id);
    }

    async update_chapter(chapter_id:UniqueId, chapter_data:Chapter):Promise<Chapter> {
        return this.boundary.remote('update_chapter', chapter_id, chapter_data);
    }

    async reorder_chapter(book_uid:UniqueId, from_pos:number, to_pos:number):Promise<boolean> {
        return this.boundary.remote('reorder_chapter', book_uid, from_pos, to_pos);
    }

    async fetch_stripped_chapters(book_uid:UniqueId):Promise<Chapter[]> {
        return this.boundary.remote('fetch_stripped_chapters', book_uid);
    }

    async create_chapter(new_chapter:Chapter):Promise<Chapter | undefined > {
        return this.boundary.remote('create_chapter', new_chapter);
    }

    async fetch_scene(scene_uid:UniqueId):Promise<Scene> {
        return this.boundary.remote('fetch_scene', scene_uid);
    }

    async fetch_scene_markedup(scene_uid:UniqueId):Promise<string> {
        return this.boundary.remote('fetch_scene_markedup', scene_uid);
    }

    async process_scene_markdown(scene_uid:UniqueId, raw_text:string) {
        return this.boundary.remote('process_scene_markdown', scene_uid, raw_text);
    }

    async update_scene(scene_uid:UniqueId, new_data:Scene) {
        return this.boundary.remote('update_scene', scene_uid, new_data);
    }

    async create_scene(chapter_id:UniqueId, title:string, position:number = -1) {
        return this.boundary.remote('create_scene', chapter_id, title, position);
    }

    async delete_scene(chapter_uid:UniqueId, scene_uid:UniqueId):Promise<boolean> {
        return this.boundary.remote('delete_scene', chapter_uid, scene_uid);
    }

    async reorder_scene(chapterId:string, from_pos:number, to_pos:number) {
        return this.boundary.remote('reorder_scene', chapterId, from_pos, to_pos);
    }

    async reorder_scenes(new_order:Scene[]):Promise<Chapter> {
        return this.boundary.remote('reorder_scenes', new_order);
    }

    async attach_scene_status2scene(scene_uid:UniqueId, status_uid:UniqueId):Promise<boolean> {
        return this.boundary.remote('attach_scene_status2scene', scene_uid, status_uid);
    }

    async list_all_characters(book_uid:UniqueId):Promise<Character[]> {
        return this.boundary.remote('list_all_characters', book_uid);
    }

    async list_characters_by_scene(scene_uid:UniqueId):Promise<Character[]> {
        return this.boundary.remote('list_characters_by_scene', scene_uid);
    }

    async search_characters(query:string):Promise<Character[]> {
        return this.boundary.remote('search_characters', query);
    }

    async add_character_to_scene(scene_uid:UniqueId, toon_uid:UniqueId):Promise<Scene> {
        return this.boundary.remote('add_character_to_scene', scene_uid, toon_uid);
    }

    async remove_character_from_scene(character_uid:UniqueId, scene_uid:UniqueId):Promise<boolean> {
        return this.boundary.remote('remove_character_from_scene', character_uid, scene_uid);
    }

    async create_new_character_to_scene(book_uid:UniqueId, scene_uid:UniqueId, new_name:string):Promise<Scene> {
        return this.boundary.remote('create_new_character_to_scene', book_uid, scene_uid, new_name);
    }

    async fetch_character(book_uid:UniqueId, character_uid:UniqueId):Promise<Character> {
        return this.boundary.remote('fetch_character', book_uid, character_uid);
    }

    async update_character(changed_character:Character):Promise<Character> {
        return this.boundary.remote('update_character', changed_character);
    }

    async delete_character(character_uid:UniqueId):Promise<boolean> {
        return this.boundary.remote('delete_character', character_uid);
    }

    async fetchAllSettings():Promise<Setting[]> {
        return this.boundary.remote('fetchAllSettings', );
    }

    async getSetting(name:string):Promise<common_setting_type> {
        return this.boundary.remote('getSetting', name);
    }

    async setSetting(name:string, value:common_setting_type) {
        return this.boundary.remote('setSetting', name, value);
    }

    async bulk_update_settings(changeset:Setting) {
        return this.boundary.remote('bulk_update_settings', changeset);
    }

    async bulkDefaultSettings(changeset:any) {
        return this.boundary.remote('bulkDefaultSettings', changeset);
    }

    async set_default_setting(name:any, val:any, type:any) {
        return this.boundary.remote('set_default_setting', name, val, type);
    }

    async fetch_all_scene_statuses(book_uid:UniqueId):Promise<SceneStatus[]> {
        return this.boundary.remote('fetch_all_scene_statuses', book_uid);
    }

    async fetch_scene_status(status_uid:UniqueId):Promise<SceneStatus> {
        return this.boundary.remote('fetch_scene_status', status_uid);
    }

    async create_scene_status(book_uid:UniqueId, name:string, color:string, scene_uid:UniqueId | undefined = undefined):Promise<SceneStatus> {
        return this.boundary.remote('create_scene_status', book_uid, name, color, scene_uid);
    }

    async update_scene_status(status_uid:UniqueId, changeset:SceneStatus):Promise<SceneStatus> {
        return this.boundary.remote('update_scene_status', status_uid, changeset);
    }
/* Removes the targetted record

TODO verify this cascades

:param status_uid:
:return: */
    async delete_scene_status(status_uid:UniqueId) {
        return this.boundary.remote('delete_scene_status', status_uid);
    }

    async importer_find_source(optional_dir:string | undefined):Promise<string> {
        return this.boundary.remote('importer_find_source', optional_dir);
    }

    async importer_list_files(filepath:string):Promise<ImportedBook> {
        return this.boundary.remote('importer_list_files', filepath);
    }


}

export default APIBridge