import {Entity, IComponentType} from "./entity";
import { Component } from "./component";
import { Engine } from "./Engine";

export class EntityManager {
    public static instance: EntityManager;
    entities: Map<number, Entity> = new Map<number, Entity>();
    nextId: number = 1;
    engine: Engine;

    constructor(engine: Engine) {
        EntityManager.instance = this;
        this.engine = engine;
    }

    public createEntity(): Entity{
        let e: Entity = new Entity();
        e.engine = this.engine;
        e.id = this.nextId++;
        this.entities.set(e.id, e);
        return e;
    }

    public getEntity(id: number): Entity {
        return <Entity>this.entities.get(id);
    }
    getAll<T extends Component>(type: IComponentType<T>): Entity[] {
        let r: Entity[] = [];
        this.entities.forEach(e => r.push(e));
        return r;
    }
}