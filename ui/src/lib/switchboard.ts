import { Deferred } from './deferred'

type defferedCallback = (...args: any[]) => any | void
type defferedCallbacks = { [key: string]: defferedCallback }

declare global {
    interface Window {
        returnCall: (identifier: string, result: any) => void
    }
}

export class Switchboard {
    callbacks: defferedCallbacks
    constructor() {
        this.callbacks = {}
        window.returnCall = this.returnVal.bind(this)
        window.callBack = this.callBack.bind(this)
    }

    public generate() {
        const d = new Deferred()
        const callerId = this.register(d)
        return [d, callerId]
    }

    private generateId() {
        let newId = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz0123456789'
        const charLen = characters.length

        while (newId.length < 12) {
            newId += characters.charAt(Math.floor(Math.random() * charLen))
        }
        return newId
    }

    public register(d: Deferred) {
        const identifer = this.generateId()
        this.callbacks[identifer] = d.callback
        return identifer
    }

    public deregister(identifier: string) {
        if (this.callbacks[identifier]) {
            delete this.callbacks[identifier]
        }
    }

    public callBack(identifier: string, result: any) {
        if (this.callbacks[identifier]) {
            this.callbacks[identifier](result)
        }
    }

    public returnVal(identifier: string, result: any) {
        if (this.callbacks[identifier]) {
            this.callbacks[identifier](result)
            delete this.callbacks[identifier]
        }
    }
}
