import { System } from "../engine/System";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { Point, Texture, Rectangle, Sprite } from "pixi.js";
import { Config } from "./config";
import { PickupSystem } from "./PickupSystem";
import { b2BodyType } from "@flyover/box2d";
import { Levels, Level } from "./Levels";
import { Entity } from "../engine/entity";
import { LevelObjectComponent } from "./LevelObjectComponent";
import { GameEvent } from "./GameEvent";
import { ParticleSystem } from "../engine/systems/ParticleSystem";
import { ParticleDef } from "../engine/components/ParticleComponent";
import { PickupComponent } from "../engine/components/PickupComponent";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { Engine } from "../engine/Engine";
import { MessageSystem } from "./MessageSystem";
import { Transform } from "../engine/components/Transform";
import { FixtureComponent } from "./FixtureComponent";
import { TtlSystem } from "./TtlSystem";
import { MoverComponent } from "./MoverComponent";
import { SoundSystem } from "./SoundSystem";

export class LevelSystem extends System {
    static sname = "levelsystem";

    wallTexture: PIXI.BaseTexture;
    physicsObjectTexture: PIXI.Texture;
    levelContainer: PIXI.Container;
    physics: PhysicsSystem;
    playerStart: Point;
    currentLevelIndex: number = -1;
    loadNextLevel: number = 4;
    levels: Level[] = [
        Levels.level1,
        Levels.level2,
        Levels.level3,
        Levels.level4,
        Levels.level5,
    ];
    particles: ParticleSystem;
    pickups: PickupSystem;
    
    static first_shot = true;
    static checkFirstShot(engine: Engine) {
        if (LevelSystem.first_shot) {
            Engine.instance.get(MessageSystem).addMessage(
                new Point(320, 220), Engine.instance.uiStage, 
                "It fires BOUNCY BALLS?  Okay...", 10, 0xff8080);
            LevelSystem.first_shot = false;
        }
    };
    
    update(deltaTime: number): void {
        if (this.loadNextLevel != this.currentLevelIndex) {
            this.destroyLevel();
            if (this.loadNextLevel >= this.levels.length) {
                this.loadNextLevel = -1;
                this.currentLevelIndex = -1;
                this.engine.events.emit(GameEvent.GAME_OVER);
                return;
            }
            this.loadLevel(this.levels[this.loadNextLevel]);
            this.currentLevelIndex = this.loadNextLevel;
        }
    }

    destroyLevel() {
        this.engine.events.emit(GameEvent.END_LEVEL);
        let levelObjects = this.engine.entityManager.getAll(LevelObjectComponent);
        for (let e of levelObjects) {
            this.engine.entityManager.deleteNow(e);
        }
    }

    startGame() {
        this.levelContainer = new PIXI.Container();
        this.physics = this.engine.get(PhysicsSystem);
        this.pickups = this.engine.get(PickupSystem);
        this.engine.gameStage.addChild(this.levelContainer);
        this.wallTexture = PIXI.BaseTexture.from("3x3bluewalls");
        this.physicsObjectTexture = PIXI.Texture.from("physicstile");
        this.particles = this.engine.get(ParticleSystem);
    }

    loadLevel(level: Level) {
        let map = level.map;
        for (let y = 0; y < map.length; y++) {
            let row = map[y];
            for (let x = 0; x < row.length; x++) {
                let c = row[x];
                let worldX = x * Config.tileSize;
                let worldY = y * Config.tileSize;
                let e: Entity | null = null;
                if (c === "P") {
                    this.playerStart = new Point(x * Config.tileSize, y * Config.tileSize);
                } else if (c === "W") {
                    e = this.createGround(worldX, worldY);
                } else if (c === "S") {
                    e = this.pickups.newPickup("star", worldX, worldY, new Rectangle(9, 10, 14, 15), b2BodyType.b2_dynamicBody, "powerup01_s");
                } else if (c === "T") {
                    e = this.pickups.newPickup("engine", worldX, worldY, new Rectangle(8, 25, 16, 7), b2BodyType.b2_dynamicBody, "powerup02_s");
                } else if (c === "O") {
                    e = this.pickups.newCirclePickup("wormhole", worldX, worldY, 32, b2BodyType.b2_kinematicBody, SoundSystem.randomSound(SoundSystem.wormholeSounds));
                    this.particles.addParticleEmitter(e, ParticleDef.WORMHOLE);
                    e.get(PhysicsComponent).body.GetFixtureList()!.m_isSensor = true;
                } else if (c === "G") {
                    e = this.pickups.newPickup("turret", worldX, worldY, new Rectangle(10, 4, 12, 18), b2BodyType.b2_dynamicBody, "powerup03_s");
                } else if (c == "-") {
                    let start = x;
                    for (x = x + 1; x < row.length; x++) {
                        c = row[x];
                        if (c != "-") {
                            x--;
                            break;
                        }
                    }
                    let len = x - start + 1;
                    e = this.createHorizontalBeam(worldX, worldY, len);
                } else if (c == "H") {
                    e = this.pickups.newPickup("hook", worldX, worldY, new Rectangle(8, 12, 16, 20), b2BodyType.b2_dynamicBody, "powerup04_s");
                } else if (c == "<") {
                    e = this.createFixture("button_unpressed", worldX, worldY, new Rectangle(17, 0, 15, 32), "button01_s");
                } else if (c == "=") {
                    e = this.createTunnel(worldX, worldY);
                } else if (c == "!") {
                    e = this.createFixture("explodingcrate", worldX, worldY, new Rectangle(0,0,32,32), "explosion01_s");
                }


                if (level.messages[c]) {
                    if (!e) {
                        e = this.pickups.newPickup("message", worldX, worldY, new Rectangle(0,0,32,32), b2BodyType.b2_kinematicBody, "message01_s");
                        let fixture = e.get(PhysicsComponent).body.GetFixtureList();
                        while (fixture) {
                            fixture.m_isSensor = true;
                            fixture = fixture.m_next;
                        }
                    }
                    e.get(PickupComponent).message = level.messages[c];
                }
                if (e) {
                    e.getOrAdd(LevelObjectComponent);
                }
            }
        }

        for (let ev of level.events) {
            this.engine.events.addListener(ev[0], () => {
                ev[1](this.engine);
            });
        }

        this.engine.events.emit(GameEvent.START_LEVEL, level)
    }
    // createPhysicsTile(x: number, y: number) {
    //     let e = this.physics.createStatic(new PIXI.Rectangle(x, y, Config.tileSize, Config.tileSize), b2BodyType.b2_dynamicBody);
    //     let s = e.add(SpriteComponent);
    //     let t = this.physicsObjectTexture;
    //     s.LoadFrame(t, new Rectangle(0, 0, Config.tileSize, Config.tileSize));
    //     s.sprite.pivot = new Point(0, 0);
    //     return e;
    // }

    createHorizontalBeam(x: number, y: number, count: number): Entity {
        let e = this.physics.createStatic(new PIXI.Rectangle(x, y, count * Config.tileSize, Config.tileSize), b2BodyType.b2_dynamicBody);
        let s = e.add(SpriteComponent);
        s.Load("this is not a real asset");
        let t = this.physicsObjectTexture;
        for (let i = 0; i < count; i++) {
            let tile = PIXI.Sprite.from(t);
            tile.pivot = new Point(0,0);
            tile.position = new Point(i * Config.tileSize, 0);
            s.sprite.addChild(tile);
        }
        return e;
    }

    private createGround(x: number, y: number): Entity {
        let t = new PIXI.Texture(this.wallTexture, new Rectangle(64,0,Config.tileSize,Config.tileSize));
        let e = this.physics.createStatic(new PIXI.Rectangle(x, y, Config.tileSize, Config.tileSize));
        let s = e.add(SpriteComponent);
        s.LoadFrame(this.wallTexture, new Rectangle(64, 0, Config.tileSize, Config.tileSize));
        s.sprite.pivot = new Point(0, 0);
        return e;
    }

    private createTunnel(x: number, y: number) {
        let e = this.physics.createStatic(new PIXI.Rectangle(x, y, Config.tileSize, 4));
        let s = e.add(SpriteComponent);
        s.Load("narrowhorizontaltunnel");
        s.sprite.pivot = new Point(0,0);

        // Second entity for bottom half of tunnel physics only
        let e2 = this.physics.createStatic(new PIXI.Rectangle(x, y + Config.tileSize - 4, Config.tileSize, 4));
        e2.add(LevelObjectComponent);
        return e;
    }

    private createFixture(what: string, worldX: number, worldY: number, collisionRect: Rectangle, sound: string): Entity | null {
        let e: Entity = this.engine.entityManager.createEntity(what);
        let t = e.add(Transform);
        let s = e.add(SpriteComponent);
        s.Load(what);

        let pickup = e.add(PickupComponent);
        pickup.what = what;
        pickup.sound = sound;
        pickup.isFixture = true;

        t.pos.set(worldX, worldY);
        let physics = e.getOrAdd(PhysicsComponent);
        physics.contactListener = this.onFixtureContact.bind(this);
        s.sprite.pivot = new Point(collisionRect.x, 0);
        this.physics.addBox(e, new Rectangle(0, 0, collisionRect.width, collisionRect.height), b2BodyType.b2_staticBody);

        e.add(FixtureComponent).what = what;
        return e;
    }

    onFixtureContact(self: PhysicsComponent, other: PhysicsComponent) {
        console.log("Fixture touched by " + other.entity.debugName);
        let fixture = self.entity.get(FixtureComponent);
        if (fixture && fixture.what === "button_unpressed") {
            this.explodeThings();
            let s = self.entity.get(SpriteComponent);
            s.sprite.destroy();
            s.Load("button_pressed");
            fixture.what = "button_pressed";
        }
    }

    explodeThings() {
        let crates = this.engine.entityManager.getAll(FixtureComponent);
        for (let e of crates) {
            if (e.get(FixtureComponent).what == "explodingcrate") {
                this.engine.entityManager.deleteEntity(e);
                this.doExplosion(e.get(Transform).pos);
            }
        }
    }

    doExplosion(p: Point) {
        for (let i = 0; i < 5; i++) {
            let e = this.engine.entityManager.createEntity("explosion");
            let t = e.add(Transform);
            let s = e.add(SpriteComponent);
            t.pos = p;
            s.Load("explosion");
            this.engine.get(TtlSystem).setTtl(e, 1);
            let mover = e.add(MoverComponent);
            mover.rotateSpeed = Math.random() * Math.PI / 2 - (Math.PI / 4);
            mover.scaleSpeed = Math.random() - 0.5;
            this.engine.get(SoundSystem).playFromList(SoundSystem.collisionSounds);
        }
    }

    advance() {
        // Doesn't advance immediately, waits for update.
        this.loadNextLevel = this.currentLevelIndex + 1;
    }

    restartLevel() {
        this.currentLevelIndex = -1;
    }
}