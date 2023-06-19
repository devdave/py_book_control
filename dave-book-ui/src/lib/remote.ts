

interface Boundary {
    remote: (method_name:string, ...args:any)=>any
}

class APIBridge {

    boundary:Boundary
    
    constructor(boundary:Boundary) {
        this.boundary = boundary
    }

    
    
    async info( message:any, ) {
        
        return await this.boundary.remote("info", message, );
    }
    
    
    async alert( message:any, ) {
        
        return await this.boundary.remote("alert", message, );
    }
    
    
    async get_current_book( ) {
        
        return await this.boundary.remote("get_current_book", );
    }
    
    
    async find_source( ) {
        
        return await this.boundary.remote("find_source", );
    }
    
    
    async create_source( ) {
        
        return await this.boundary.remote("create_source", );
    }
    
    
    async fetch_chapters( ) {
        
        return await this.boundary.remote("fetch_chapters", );
    }
    
    
    async fetch_chapter( chapter_id:any, ) {
        
        return await this.boundary.remote("fetch_chapter", chapter_id, );
    }
    
    
    async update_chapter( chapter_id:any, chapter_data:any, ) {
        
        return await this.boundary.remote("update_chapter", chapter_id, chapter_data, );
    }
    
    
    async fetch_stripped_chapters( ) {
        
        return await this.boundary.remote("fetch_stripped_chapters", );
    }
    
    
    async create_chapter( chapter_name:any, ) {
        
        return await this.boundary.remote("create_chapter", chapter_name, );
    }
    
    
    async fetch_scene( scene_uid:any, ) {
        
        return await this.boundary.remote("fetch_scene", scene_uid, );
    }
    
    
    async update_scene( scene_uid:any, new_data:any, ) {
        
        return await this.boundary.remote("update_scene", scene_uid, new_data, );
    }
    
    
    async create_scene( chapter_uid:any, scene_title:any, ) {
        
        return await this.boundary.remote("create_scene", chapter_uid, scene_title, );
    }
    
    
    async save_reordered_chapters( chapters:any, ) {
        
        return await this.boundary.remote("save_reordered_chapters", chapters, );
    }
    
    /* Will be deprecated, automatically loads up the 1st Book for use with the app.
    :return: bool */
    async boot_up( ) {
        
        return await this.boundary.remote("boot_up", );
    }
    

}

export default APIBridge;