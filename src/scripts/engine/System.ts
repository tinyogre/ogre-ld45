import { Engine } from "./Engine";

export abstract class System {
    sname: string;
    engine: Engine;
    startGame(): void {
    }
    abstract update(deltaTime: number): void;

}
