
import {System} from "../engine/System";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { Transform } from "../engine/components/Transform";
import { Point, Rectangle } from "pixi.js";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { Entity } from "../engine/entity";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { KeyboardSystem } from "../engine/systems/KeyboardSystem";
import { Config } from "./config";
import {StandardGamepad, StandardGamepadMapping, StandardGamepadButton} from "../third_party/standard-gamepad";
import { StarTwit } from "./ogre-star-twit";
import { XY, b2Vec2 } from "@flyover/box2d";
import { PlayerComponent } from "./PlayerComponent";
import { ParticleSystem } from "../engine/systems/ParticleSystem";
import { ParticleEmitterDef } from "../engine/components/ParticleComponent";

export class PlayerSystem extends System {
    static sname: string = "player";
    player: Entity;
    keyboard: KeyboardSystem;
    mapping: StandardGamepadMapping = new StandardGamepadMapping();
    gamepad: StandardGamepad = new StandardGamepad(navigator, window, this.mapping);
    shotTimer: number = 0;

    startGame() {
        this.keyboard = this.engine.get(KeyboardSystem);
        let physics = this.engine.get(PhysicsSystem);
        this.player = this.engine.entityManager.createEntity("player");
        let sprite = this.player.add(SpriteComponent);
        let transform = this.player.add(Transform);
        let playerComponent = this.player.add(PlayerComponent);
        let particles = this.engine.get(ParticleSystem);
        
        let thrustDef:ParticleEmitterDef = {
            sprite: "thrustparticle",
            permanent: true,            
            rotation: 0.5 * Math.PI,
            arc: 0.1 * Math.PI,
            particleDuration: 2,
            spawnPerSecond: 50,
            velocity: 50,
            gravityCoefficient: 0.1,
        };

        playerComponent.thrustEmitter = particles.addParticleEmitter(this.player, thrustDef);
        playerComponent.thrustEmitter.enabled = true;

        transform.pos = new Point(160, 0);
        transform.rotation = 0;
        //physics.addBox(this.player, new Rectangle(-16, -16, 32, 32));
        let shape:XY[] = [
            { x: -16, y: 16},
            { x: 16, y: 16 },
            { x: 0, y: -16 },
        ]
        physics.addShape(this.player, shape);
        sprite.Load('ship');
        sprite.sprite.pivot = new Point(16, 16);

        this.gamepad.onConnected(() => { console.log("Gamepad connected!")});
        this.gamepad.enable();
    }

    static rotate(v: b2Vec2, r: number): b2Vec2 {
        let out = new b2Vec2;
        return b2Vec2.RotateV(v, r, out);
    }

    update(deltaTime: number): void {
        let rotate: number = 0;
        let pc = this.player.get(PhysicsComponent);
        let t = this.player.get(Transform);
        let player = this.player.get(PlayerComponent);

        let buttons = this.gamepad.getPressedButtons();
        let joystick: any = this.gamepad.getJoystickPositions();
        let leftStick: Point = new Point(0,0);
        if (joystick && joystick.left) {
            leftStick = new Point(joystick.left.horizontal, joystick.left.vertical);
        }

        if (player.canThrust) {
            if (this.keyboard.isKeyDown(87, 38) || buttons.includes(StandardGamepadButton.A)) {
                pc.body.ApplyForce(PlayerSystem.rotate(new b2Vec2(0, -Config.playerThrust), t.rotation), pc.body.GetWorldCenter());
                player.thrustEmitter.enabled = true;
            } else {
                player.thrustEmitter.enabled = false;
            }
        }

        if (player.canSteer) {
            if (this.keyboard.isKeyDown(65, 37) || leftStick.x < -0.5) {
                rotate -= 1;
            }
            if (this.keyboard.isKeyDown(68, 39) || leftStick.x > 0.5) {
                rotate += 1;
            }
        }
        if (rotate !== 0) {
          pc.body.ApplyTorque(rotate * 1000);
        }

        this.shotTimer -= deltaTime;
        if (this.keyboard.isKeyDown(32)) {
            if (this.shotTimer <= 0) {
                console.log('fire');
                this.shotTimer = 1.0;
            }
        }
        this.engine.app.stage.position = new Point(-t.pos.x + StarTwit.CANVAS_SIZE.x / 2, -t.pos.y + StarTwit.CANVAS_SIZE.y / 2);
    }
}