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
import { ParticleSystem } from "../engine/systems/ParticleSystem";
import { b2BodyType } from "@flyover/box2d";

export class PickupSystem extends System {
    static sname: string = "pickup";
    physics: PhysicsSystem;
    particles: ParticleSystem;

    startGame() {
        this.physics = this.engine.get(PhysicsSystem);
        this.particles = this.engine.get(ParticleSystem);
        // this.newPickup("star", 160, 440, new Rectangle(9, 10, 14, 15));
        // this.newPickup("engine", 300, 400, new Rectangle(8, 25, 16, 7));
    }

    newPickup(what: string, x: number, y: number, r: Rectangle, bodyType?: b2BodyType): Entity {
        let e: Entity = this.engine.entityManager.createEntity(what);
        let t = e.add(Transform);
        let s = e.add(SpriteComponent);
        s.Load(what);
        s.sprite.pivot = new Point(r.x + r.width / 2, r.y + r.height / 2);

        let pickup = e.add(PickupComponent);
        pickup.what = what;
        t.pos.set(x, y);
        this.physics.addBox(e, new Rectangle(-r.width / 2, -r.height / 2, r.width, r.height), bodyType);
        e.get(PhysicsComponent).contactListener = this.onContact.bind(this);
        let attractDef = {
            sprite: "thrustparticle",
            permanent: true,
            rotation: 0,
            arc: 2 * Math.PI,
            particleDuration: 0.2,
            emitterDuration: 100000,
            spawnPerSecond: 20,
            velocity: 50,
            gravityCoefficient: 0,
        };
        this.particles.addParticleEmitter(e, attractDef);
        return e;
    }

    onContact(self: PhysicsComponent, other: PhysicsComponent) {
        let player = other.entity.get(PlayerComponent);
        if (!player) {
            return;
        }
        let pickup = self.entity.get(PickupComponent);
        console.log("Pickup " + pickup.what + " touched player");
        let mySprite = self.entity.get(SpriteComponent);
        
        let newPlayerSprite = PIXI.Sprite.from(mySprite.asset);

        other.entity.get(SpriteComponent).sprite.addChild(newPlayerSprite);
        
        if (pickup.what === "star") {
            player.canSteer = true;
        } else if (pickup.what == "engine") {
            player.canThrust = true;
        }

        this.engine.entityManager.deleteEntity(self.entity);
    }

    update(deltaTime: number): void {
    }
}