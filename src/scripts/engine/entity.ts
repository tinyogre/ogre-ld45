import {Component} from "./component";
import { Engine } from "./Engine";

export interface IComponentType<T extends Component> {
    new(...args: any[]): T;
    cname: string;
}

export class Entity {
    engine: Engine;
    public id: number;
    public get<T extends Component>(type: IComponentType<T>) : T {
        return <T>this.components.get(type.cname)
    }
    components: Map<string, Component> = new Map<string, Component>();
    constructor() {}

    public add<T extends Component>(type: IComponentType<T>) : T {
        let c: Component = new type();
        this.components.set(type.cname, c);
        c.entity = this;
        return <T>c;
    }
    getOrAdd<T extends Component>(type: IComponentType<T>) : T {
        let c = this.get(type);
        if (!c) {
            c = this.add(type);
        }
        return c;
    }
    remove<T extends Component>(type: IComponentType<T>): void {
        this.components.delete(type.cname);
    }

}