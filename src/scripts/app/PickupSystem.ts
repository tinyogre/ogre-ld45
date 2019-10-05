import { System } from "../engine/System";
import { Entity } from "../engine/entity";
import { start } from "repl";
import { Transform } from "../engine/components/Transform";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { PickupComponent } from "../engine/components/PickupComponent";
import { Point, Rectangle } from "pixi.js";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";

export class PickupSystem extends System {
    static sname: string = "pickup";
    physics: PhysicsSystem;

    startGame() {
        this.physics = this.engine.get(PhysicsSystem);
        this.newPickup("star", 160, 440, new Rectangle(9, 10, 13, 14));
        this.newPickup("engine", 300, 440, new Rectangle(8, 25, 15, 6));
    }

    newPickup(what: string, x: number, y: number, r: Rectangle): Entity {
        let e: Entity = this.engine.entityManager.createEntity();
        let t = e.add(Transform);
        let s = e.add(SpriteComponent);
        s.Load(what);
        s.sprite.pivot = new Point(r.x + r.width / 2, r.y + r.height / 2);

        e.add(PickupComponent);
        t.pos.set(x, y);
        this.physics.addBox(e, new Rectangle(r.x -16, r.y -16, r.width, r.height));
        return e;
    }

    update(deltaTime: number): void {
    }
    
}