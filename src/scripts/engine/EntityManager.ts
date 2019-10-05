import {Entity, IComponentType} from "./entity";
import { Component } from "./component";
import { Engine } from "./Engine";

export class EntityManager {
    public static instance: EntityManager;
    entities: Map<number, Entity> = new Map<number, Entity>();
    nextId: number = 1;
    engine: Engine;
    toDelete: Entity[] = [];

    constructor(engine: Engine) {
        EntityManager.instance = this;
        this.engine = engine;
    }

    public update() {
        for (let e of this.toDelete) {
            this.deleteNow(e);
        }
    }

    public createEntity(name?: string): Entity{
        let e: Entity = new Entity();
        if (name) {
            e.debugName = name;
        }
        e.engine = this.engine;
        e.id = this.nextId++;
        this.entities.set(e.id, e);
        return e;
    }

    public deleteEntity(e: Entity) {
        this.toDelete.push(e);
    }

    public deleteNow(e: Entity) {
        e.components.forEach((c, key, map) => {
            c.onDelete();
        })
        this.entities.delete(e.id);
        e.components.clear();
    }

    public getEntity(id: number): Entity {
        return <Entity>this.entities.get(id);
    }
    getAll<T extends Component>(type: IComponentType<T>): Entity[] {
        let r: Entity[] = [];
        this.entities.forEach(e => {
            if (e.get(type)) {
                r.push(e);
            }
        });
        return r;
    }
}