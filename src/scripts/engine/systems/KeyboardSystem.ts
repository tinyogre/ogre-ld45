import {System} from '../System'

interface keyFn {
    (key: number): void;
}

export class KeyboardSystem extends System {
    static sname = "keyboard";
    states: Set<number>;
    keyDownCallbacks: keyFn[] = [];

    update(deltaTime: number): void {
    }

    constructor() {
        super();
        window.onkeydown = (ev: KeyboardEvent) => this.onKeyDown(ev);
        window.onkeyup = (ev: KeyboardEvent) => this.onKeyUp(ev);
        this.states = new Set<number>();
    }

    onKeyDown(ev: KeyboardEvent) {
        this.states.add(ev.keyCode);
        for (let cb of this.keyDownCallbacks) {
            cb(ev.keyCode);
        }
    }

    onKeyUp(ev: KeyboardEvent) {
        this.states.delete(ev.keyCode);
    }

    addKeyDown(cb: keyFn) {
        this.keyDownCallbacks.push(cb);
    }

    isKeyDown(...args: number[]): boolean {
        for (let a of args) {
            if (this.states.has(a)) {
                return true;
            }
        }
        return false;
    }
}