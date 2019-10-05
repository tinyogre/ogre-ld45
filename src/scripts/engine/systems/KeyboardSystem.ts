import {System} from '../System'

export class KeyboardSystem extends System {
    static sname = "keyboard";
    states: Set<number>;
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
    }

    onKeyUp(ev: KeyboardEvent) {
        this.states.delete(ev.keyCode);
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