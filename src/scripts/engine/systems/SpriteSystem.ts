import { EntityManager } from "../EntityManager";
import { SpriteComponent } from "../components/SpriteComponent";
import { Entity } from "../entity";
import { Transform } from "../components/Transform";
import { System } from "../System";
import { Point } from "pixi.js";
import { DebugRenderSystem } from "./DebugRenderSystem";

export class SpriteSystem extends System {
    static sname: "sprite";
    constructor() { super(); }
    debug: DebugRenderSystem;
    update(deltaTime: number) {
        let entities: Entity[] = EntityManager.instance.getAll(SpriteComponent);
        entities.forEach(e => {
            let s = e.get(SpriteComponent);
            if (s) {
                let t = e.get(Transform);
                s.sprite.position = new Point(t.pos.x, t.pos.y);
                s.sprite.rotation = t.rotation;
            }
        })
    }
}