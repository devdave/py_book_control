

interface Boundary {
    remote: (method_name:string, ...args:any)=>any
}

class APIBridge {

    boundary:Boundary
    
    constructor(boundary:Boundary) {
        this.boundary = boundary
    }

    
    
    async info(message:string) {
        
        return await this.boundary.remote("info", message);
    }
    
    
    async alert(message:string) {
        
        return await this.boundary.remote("alert", message);
    }
    
    
    async list_books(stripped:boolean = true) {
        
        return await this.boundary.remote("list_books", stripped);
    }
    
    
    async get_current_book(stripped:boolean = true) {
        
        return await this.boundary.remote("get_current_book", stripped);
    }
    
    
    async set_current_book(book_uid:string) {
        
        return await this.boundary.remote("set_current_book", book_uid);
    }
    
    
    async update_book(changed_book:any) {
        
        return await this.boundary.remote("update_book", changed_book);
    }
    
    
    async update_book_title(book_uid:string, new_title:string) {
        
        return await this.boundary.remote("update_book_title", book_uid, new_title);
    }
    
    
    async fetch_book_simple(book_uid:string) {
        
        return await this.boundary.remote("fetch_book_simple", book_uid);
    }
    
    
    async find_source() {
        
        return await this.boundary.remote("find_source", );
    }
    
    
    async create_source() {
        
        return await this.boundary.remote("create_source", );
    }
    
    
    async fetch_chapters() {
        
        return await this.boundary.remote("fetch_chapters", );
    }
    
    
    async fetch_chapter(chapter_id:string) {
        
        return await this.boundary.remote("fetch_chapter", chapter_id);
    }
    
    
    async fetch_chapter_index(chapter_id:string) {
        
        return await this.boundary.remote("fetch_chapter_index", chapter_id);
    }
    
    
    async update_chapter(chapter_id:string, chapter_data:any) {
        
        return await this.boundary.remote("update_chapter", chapter_id, chapter_data);
    }
    
    
    async reorder_chapter(from_pos:any, to_pos:any) {
        
        return await this.boundary.remote("reorder_chapter", from_pos, to_pos);
    }
    
    
    async fetch_stripped_chapters() {
        
        return await this.boundary.remote("fetch_stripped_chapters", );
    }
    
    
    async create_chapter(new_chapter:any) {
        
        return await this.boundary.remote("create_chapter", new_chapter);
    }
    
    
    async save_reordered_chapters(chapters:any) {
        
        return await this.boundary.remote("save_reordered_chapters", chapters);
    }
    
    
    async fetch_scene(scene_uid:string) {
        
        return await this.boundary.remote("fetch_scene", scene_uid);
    }
    
    
    async fetch_scene_markedup(scene_uid:string) {
        
        return await this.boundary.remote("fetch_scene_markedup", scene_uid);
    }
    
    
    async process_scene_markdown(scene_uid:string, raw_text:string) {
        
        return await this.boundary.remote("process_scene_markdown", scene_uid, raw_text);
    }
    
    
    async update_scene(scene_uid:string, new_data:any) {
        
        return await this.boundary.remote("update_scene", scene_uid, new_data);
    }
    
    
    async create_scene(chapterId:any, title:any, position:any = -1) {
        
        return await this.boundary.remote("create_scene", chapterId, title, position);
    }
    
    
    async delete_scene(chapter_uid:string, scene_uid:string) {
        
        return await this.boundary.remote("delete_scene", chapter_uid, scene_uid);
    }
    
    
    async reorder_scene(chapterId:string, from_pos:any, to_pos:any) {
        
        return await this.boundary.remote("reorder_scene", chapterId, from_pos, to_pos);
    }
    
    
    async reorder_scenes(new_order:any) {
        
        return await this.boundary.remote("reorder_scenes", new_order);
    }
    
    
    async list_all_characters() {
        
        return await this.boundary.remote("list_all_characters", );
    }
    
    
    async list_characters_by_scene(scene_id:any) {
        
        return await this.boundary.remote("list_characters_by_scene", scene_id);
    }
    
    
    async search_characters(query:any) {
        
        return await this.boundary.remote("search_characters", query);
    }
    
    
    async add_and_create_new_character_to_scene(book_id:any, scene_uid:any, new_name:any) {
        
        return await this.boundary.remote("add_and_create_new_character_to_scene", book_id, scene_uid, new_name);
    }
    

}

export default APIBridge;