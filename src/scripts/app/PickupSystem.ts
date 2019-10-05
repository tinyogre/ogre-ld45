import { System } from "../engine/System";
import { Entity } from "../engine/entity";
import { start } from "repl";
import { Transform } from "../engine/components/Transform";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { PickupComponent } from "../engine/components/PickupComponent";
import { Point, Rectangle, Sprite } from "pixi.js";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { PlayerComponent } from "./PlayerComponent";

export class PickupSystem extends System {
    static sname: string = "pickup";
    physics: PhysicsSystem;

    startGame() {
        this.physics = this.engine.get(PhysicsSystem);
        this.newPickup("star", 160, 440, new Rectangle(9, 10, 14, 15));
        this.newPickup("engine", 300, 400, new Rectangle(8, 25, 16, 7));
    }

    newPickup(what: string, x: number, y: number, r: Rectangle): Entity {
        let e: Entity = this.engine.entityManager.createEntity(what);
        let t = e.add(Transform);
        let s = e.add(SpriteComponent);
        s.Load(what);
        s.sprite.pivot = new Point(r.x + r.width / 2, r.y + r.height / 2);

        let pickup = e.add(PickupComponent);
        pickup.what = what;
        t.pos.set(x, y);
        this.physics.addBox(e, new Rectangle(-r.width / 2, -r.height / 2, r.width, r.height));
        e.get(PhysicsComponent).contactListener = this.onContact.bind(this);
        return e;
    }

    onContact(self: PhysicsComponent, other: PhysicsComponent) {
        if (other.entity.get(PlayerComponent)) {
            let pickup = self.entity.get(PickupComponent);
            console.log("Pickup " + pickup.what + " touched player");
            let mySprite = self.entity.get(SpriteComponent);
            
            let newPlayerSprite = PIXI.Sprite.from(mySprite.asset);

            other.entity.get(SpriteComponent).sprite.addChild(newPlayerSprite);
            
            this.engine.entityManager.deleteEntity(self.entity);
        }
    }

    update(deltaTime: number): void {
    }
}