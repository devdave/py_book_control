import {Switchboard} from "./switchboard";
import {Deferred} from "./deferred";


type remoteMethod = (...args:any[]) => any | void;
type remoteMethods = {[key: string]: remoteMethod };

declare global {
    interface Window {
        pywebview: {
            api: remoteMethods
        };
    }
}


export const PYWEBVIEWREADY:string = "pywebviewready";

class Boundary {



    isConnected: boolean;
    backendHooks: remoteMethods;
    switch: Switchboard;
    constructor() {
        this.isConnected = false;
        this.backendHooks = {};
        this.switch = new Switchboard();

    }

    private connect(){
        if(this.isConnected === true){
            return;
        }

        if(window?.pywebview?.api['info'] !== undefined){
            this.backendHooks = window.pywebview.api;
            this.isConnected = true;
            this.info("Connected!");
        } else {
            throw Error(`Unable to connect to backend; ${window.pywebview}`);
        }
    }

    public remote(remoteName: string, ...args: any[]): Promise<any> {

        this.info(`Calling ${remoteName} with:`, args);
        console.trace();
        return this._remote(remoteName, ...args);

    }

    private _remote(remoteName: string, ...args: any[]): Promise<any> {
        this.connect();

        if(!(remoteName in this.backendHooks)){
            throw Error(`Missing ${remoteName} from backend hooks.`);
        }

        const func = this.backendHooks[remoteName];
        return func.apply(this, args);
    }

    public request(remoteName: string, ...args: any[]): Deferred {
        const d = new Deferred();
        let id = this.switch.register(d);
        this.remote(remoteName, [...args, id]);
        return d;
    }

    public info(...message:any[]): void {
        console.log(...message);
        this._remote("info", message);
    }

}

export default Boundary;