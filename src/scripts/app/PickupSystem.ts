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
import { LevelSystem } from "./LevelSystem";
import { MessageSystem } from "./MessageSystem";
import { GameEvent } from "./GameEvent";
import { SoundSystem } from "./SoundSystem";

export class PickupSystem extends System {
    static sname: string = "pickup";
    physics: PhysicsSystem;
    particles: ParticleSystem;
    messages: MessageSystem;
    sounds: SoundSystem;

    startGame() {
        this.physics = this.engine.get(PhysicsSystem);
        this.particles = this.engine.get(ParticleSystem);
        this.messages = this.engine.get(MessageSystem);
        this.sounds = this.engine.get(SoundSystem);
    }

    private internalNewPickup(what: string, x: number, y: number, sound?: string): Entity {
        let e: Entity = this.engine.entityManager.createEntity(what);
        let t = e.add(Transform);
        let s = e.add(SpriteComponent);
        s.Load(what);

        let pickup = e.add(PickupComponent);
        pickup.what = what;
        if (!sound) {
            sound = "powerup01_s";
        }
        pickup.sound = sound;
        t.pos.set(x, y);
        let physics = e.getOrAdd(PhysicsComponent);
        physics.contactListener = this.onContact.bind(this);
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
        if (what == "star" || what == "engine" || what == "turret" || what == "hook") {
            this.particles.addParticleEmitter(e, attractDef);
        }
        return e;

    }

    newPickup(what: string, x: number, y: number, r: Rectangle, bodyType?: b2BodyType, sound?: string): Entity {
        let e = this.internalNewPickup(what, x, y, sound);
        let s = e.get(SpriteComponent);
        s.sprite.pivot = new Point(r.x + r.width / 2, r.y + r.height / 2);
        this.physics.addBox(e, new Rectangle(-r.width / 2, -r.height / 2, r.width, r.height), bodyType);
        return e;
    }

    newCirclePickup(what: string, x: number, y: number, radius: number, bodyType?: b2BodyType, sound?: string): Entity {
        let e = this.internalNewPickup(what, x, y, sound);
        let s = e.get(SpriteComponent);
        s.sprite.pivot = new Point(radius, radius);
        this.physics.addCircle(e, radius, bodyType);
        return e;
    }

    onContact(self: PhysicsComponent, other: PhysicsComponent) {
        let player = other.entity.get(PlayerComponent);
        if (!player) {
            return;
        }

        let pickup = self.entity.get(PickupComponent);
        this.sounds.play(pickup.sound);

        if (pickup.what == "wormhole") {
            this.engine.get(LevelSystem).advance();
            return;
        }

        if (pickup.message) {
            this.showMessage(pickup);
        }

        let mySprite = self.entity.get(SpriteComponent);
        
        let newPlayerSprite = PIXI.Sprite.from(mySprite.asset);

        other.entity.get(SpriteComponent).sprite.addChild(newPlayerSprite);
        
        if (pickup.what === "star") {
            this.engine.events.emit(GameEvent.ADD_STEERING);
        } else if (pickup.what == "engine") {
            this.engine.events.emit(GameEvent.ADD_THRUST);
        } else if (pickup.what == "turret") {
            this.engine.events.emit(GameEvent.ADD_TURRET, newPlayerSprite);
        } else if (pickup.what == "hook") {
            this.engine.events.emit(GameEvent.ADD_TOW_HOOK, newPlayerSprite);
        }

        this.engine.entityManager.deleteEntity(self.entity);
    }
    
    showMessage(pickup: PickupComponent) {
        this.messages.addMessage(pickup.entity.get(Transform).pos, this.engine.gameStage, pickup.message!, 10, 0xffff00);
    }

    update(deltaTime: number): void {
    }
}