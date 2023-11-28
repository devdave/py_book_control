import { Deferred } from "./deferred";

type deferredCallback = (...args: [unknown]) => void;
type deferredCallbacks = { [key: string]: deferredCallback };

declare global {
  interface Window {
    returnCall: (identifier: string, result: never) => void;
    callBack: (identifier: string, result: never) => void;
  }
}

export class Switchboard {
  callbacks: deferredCallbacks;
  constructor() {
    this.callbacks = {};
    window.returnCall = this.returnVal.bind(this);
    window.callBack = this.callBack.bind(this);
  }

  public generate(callBack: (response: unknown) => void): string {
    const id = this.generateId();
    this.callbacks[id] = callBack;
    return id;
  }

  private generateId() {
    let newId = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz0123456789";
    const charLen = characters.length;

    while (newId.length < 12) {
      newId += characters.charAt(Math.floor(Math.random() * charLen));
    }
    return newId;
  }

  public register(d: Deferred) {
    const identifer = this.generateId();
    this.callbacks[identifer] = d.callback;
    return identifer;
  }

  public deregister(identifier: string) {
    if (this.callbacks[identifier]) {
      delete this.callbacks[identifier];
    }
  }

  public callBack(identifier: string, result: unknown) {
    console.debug("Called ", identifier, result);
    if (this.callbacks[identifier]) {
      this.callbacks[identifier](result);
    }
  }

  public returnVal(identifier: string, result: unknown) {
    if (this.callbacks[identifier]) {
      this.callbacks[identifier](result);
      delete this.callbacks[identifier];
    }
  }
}
