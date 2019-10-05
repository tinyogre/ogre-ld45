
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
import { LevelSystem } from "./LevelSystem";
import { GameEvent } from "./GameEvent";
import { Level } from "./Levels";
import { MessageSystem } from "./MessageSystem";
import { TtlSystem } from "./TtlSystem";

export class PlayerSystem extends System {
    static sname: string = "player";
    player?: Entity;
    playerComponent: PlayerComponent;
    keyboard: KeyboardSystem;
    messages: MessageSystem;
    physics: PhysicsSystem;

    mapping: StandardGamepadMapping = new StandardGamepadMapping();
    gamepad: StandardGamepad = new StandardGamepad(navigator, window, this.mapping);
    shotTimer: number = 0;

    startGame() {
        this.keyboard = this.engine.get(KeyboardSystem);
        this.engine.events.addListener(GameEvent.START_LEVEL, this.startLevel.bind(this));
        this.engine.events.addListener(GameEvent.END_LEVEL, this.endLevel.bind(this));
        this.engine.events.addListener(GameEvent.ADD_STEERING, this.addSteering.bind(this));
        this.engine.events.addListener(GameEvent.ADD_THRUST, this.addThrust.bind(this));
        this.engine.events.addListener(GameEvent.ADD_TURRET, this.addTurret.bind(this));

        this.keyboard.addKeyDown(this.keyDown.bind(this));

        this.gamepad.onConnected(() => { console.log("Gamepad connected!") });
        this.gamepad.enable();
        this.messages = this.engine.get(MessageSystem);
        this.physics = this.engine.get(PhysicsSystem);
    }

    endLevel() {
        if (this.player) {
            this.engine.entityManager.deleteNow(this.player);
        }
        this.player = undefined;
    }

    startLevel(level: Level) {
        this.spawnPlayer();
    }

    spawnPlayer() {
        this.player = this.engine.entityManager.createEntity("player");
        let sprite = this.player.add(SpriteComponent);

        let transform = this.player.add(Transform);
        this.playerComponent = this.player.add(PlayerComponent);
        let particles = this.engine.get(ParticleSystem);
        
        let thrustDef:ParticleEmitterDef = {
            sprite: "thrustparticle",
            permanent: true,            
            rotation: 0.45 * Math.PI,
            arc: 0.1 * Math.PI,
            particleDuration: 2,
            spawnPerSecond: 50,
            velocity: 50,
            gravityCoefficient: 0.1,
        };

        this.playerComponent.thrustEmitter = particles.addParticleEmitter(this.player, thrustDef);
        this.playerComponent.thrustEmitter.enabled = false;

        //transform.pos = new Point(160, 0);
        transform.pos = this.engine.get(LevelSystem).playerStart;
        transform.rotation = 0;
        let shape:XY[] = [
            { x: -16, y: 16},
            { x: 16, y: 16 },
            { x: 0, y: -16 },
        ]
        this.physics.addShape(this.player, shape);
        sprite.Load('ship');
        sprite.sprite.pivot = new Point(16, 16);
    }

    keyDown(key: number) {
        console.log(key);
        if (this.playerComponent.canDebug) {
            if (key == "P".charCodeAt(0)) {
                this.engine.get(PhysicsSystem).toggleDebug();
            }
        }

        // ESC
        if (key == 27) {
            this.engine.togglePause();
        }
    }
    static rotate(v: b2Vec2, r: number): b2Vec2 {
        let out = new b2Vec2;
        return b2Vec2.RotateV(v, r, out);
    }

    update(deltaTime: number): void {
        if (!this.player) {
            return;
        }

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

        if (player.canTurret && player.turretSprite) {
            if (this.keyboard.isKeyDown("Q".charCodeAt(0))) {
                player.turretSprite.rotation -= deltaTime * Config.turretTurnRate;
            }
            if (this.keyboard.isKeyDown("E".charCodeAt(0))) {
                player.turretSprite.rotation += deltaTime * Config.turretTurnRate;
            }

            this.shotTimer -= deltaTime;
            if (this.keyboard.isKeyDown(32)) {
                if (this.shotTimer <= 0) {
                    this.fireShot(player.entity.get(Transform).pos, player.entity.get(Transform).rotation + player.turretSprite.rotation - Math.PI / 2);
                    this.shotTimer = Config.shotDelay;
                }
            }
        }
        if (rotate !== 0) {
          pc.body.ApplyTorque(rotate * 1000);
        }
        this.engine.gameStage.position = new Point(-t.pos.x + StarTwit.CANVAS_SIZE.x / 2, -t.pos.y + StarTwit.CANVAS_SIZE.y / 2);
    }

    addSteering() {
        this.playerComponent.canSteer = true;
        this.messages.addMessage(new Point(320, 450), this.engine.uiStage, "A or Left: Turn Left\nD or Right: Turn Right", 9000, 0x8888ff);
    }

    addThrust() {
        this.playerComponent.canThrust = true;
        this.messages.addMessage(new Point(320, 470), this.engine.uiStage, "W or Up: Thrust", 9000, 0x8888ff);
    }

    addTurret(sprite: PIXI.Sprite) {
        this.playerComponent.canTurret = true;
        this.playerComponent.turretSprite = sprite;
        this.playerComponent.turretSprite.pivot = new Point(16, 16);
        this.playerComponent.turretSprite.position = new Point(16, 16);
        this.messages.addMessage(new Point(320, 420), this.engine.uiStage, "Q: Aim Left\nE: Aim Right\nSpace: Shoot", 9000, 0x8888ff);
    }

    fireShot(p: Point, direction: number) {
        let directionVector = new Point(
            Math.cos(direction), Math.sin(direction)
        );
        let distanceFromShip = 8;
        p = new Point(p.x + directionVector.x * distanceFromShip, p.y + directionVector.y * distanceFromShip);
        let shot = this.engine.entityManager.createEntity();
        let t = shot.getOrAdd(Transform);
        t.pos = p;
        let pc = this.physics.addCircle(shot, 7);
        let sprite = shot.getOrAdd(SpriteComponent);
        sprite.Load("bouncyball");
        sprite.sprite.pivot = new Point(8,8);

        pc.body.SetLinearVelocity({x: directionVector.x * Config.shotSpeed, y: directionVector.y * Config.shotSpeed})
        let fixture = pc.body.GetFixtureList()!;
        fixture.m_friction = 0.25;
        fixture.m_restitution = 0.9;
        pc.fixedVisualRotation = true;
        let playerPhysics = this.player!.get(PhysicsComponent);
        playerPhysics.body.ApplyForce(new b2Vec2(-directionVector.x * Config.recoil, -directionVector.y * Config.recoil), playerPhysics.body.GetWorldCenter());
        this.engine.get(TtlSystem).setTtl(shot, Config.shotDuration);

    }
}