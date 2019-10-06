import { System } from "../engine/System";
import { MoverComponent } from "./MoverComponent";
import { Transform } from "../engine/components/Transform";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { Point } from "pixi.js";

export class MoverSystem extends System {
    static sname = "moversystem";

    update(deltaTime: number): void {
        let movers = this.engine.entityManager.getAll(MoverComponent);
        for (let e of movers) {
            let m = e.get(MoverComponent);
            let t = e.get(Transform);
            //let s = e.get(SpriteComponent);

            t.rotation = t.rotation + m.rotateSpeed * deltaTime;
            t.scale = t.scale + m.scaleSpeed * deltaTime;
            t.pos = new Point(t.pos.x + m.velocity.x * deltaTime, t.pos.y + m.velocity.y * deltaTime);
        }
    }
}