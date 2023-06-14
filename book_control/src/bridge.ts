
import {Boundary} from "./lib/boundary.ts";

export class APIBridge {

    boundary:Boundary
    
    constructor(boundary:Boundary) {
        this.boundary = boundary
    }

    
    
    async info( message:string, ) {
        
        return await this.boundary.remote("info", message, );
    }
    
    
    async alert( message:string, ) {
        
        return await this.boundary.remote("alert", message, );
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
    
    
    async create_chapter( chapter_name:string, ) {
        
        return await this.boundary.remote("create_chapter", chapter_name, );
    }
    
    
    async fetch_scene( scene_uid:string, ) {
        
        return await this.boundary.remote("fetch_scene", scene_uid, );
    }
    
    
    async update_scene( scene_uid:string, new_data:string, ) {
        
        return await this.boundary.remote("update_scene", scene_uid, new_data, );
    }
    
    
    async create_scene( chapter_uid:string, scene_name:string, ) {
        
        return await this.boundary.remote("create_scene", chapter_uid, scene_name, );
    }
    
    
    async save_reordered_chapters( chapters:string, ) {
        
        return await this.boundary.remote("save_reordered_chapters", chapters, );
    }
    
    /* Will be deprecated, automatically loads up the 1st Book for use with the app.
    :return: bool */
    async boot_up( ) {
        
        return await this.boundary.remote("boot_up", );
    }
    

}
