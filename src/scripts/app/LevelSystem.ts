import { System } from "../engine/System";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { Point, Texture, Rectangle } from "pixi.js";
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

export class LevelSystem extends System {
    static sname = "levelsystem";

    wallTexture: PIXI.BaseTexture;
    physicsObjectTexture: PIXI.Texture;
    levelContainer: PIXI.Container;
    physics: PhysicsSystem;
    playerStart: Point;
    currentLevelIndex: number = -1;
    loadNextLevel: number = 0;
    levels: Level[] = [
//        Levels.level1,
//        Levels.level2,
//        Levels.level3,
        Levels.level4,
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
                    e = this.pickups.newPickup("star", worldX, worldY, new Rectangle(9, 10, 14, 15));
                } else if (c === "T") {
                    e = this.pickups.newPickup("engine", worldX, worldY, new Rectangle(8, 25, 16, 7));
                } else if (c === "O") {
                    e = this.pickups.newCirclePickup("wormhole", worldX, worldY, 32, b2BodyType.b2_kinematicBody);
                    this.particles.addParticleEmitter(e, ParticleDef.WORMHOLE);
                    e.get(PhysicsComponent).body.GetFixtureList()!.m_isSensor = true;
                } else if (c === "G") {
                    e = this.pickups.newPickup("turret", worldX, worldY, new Rectangle(10, 4, 12, 18))
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
                    this.createHorizontalBeam(worldX, worldY, len);
                } else if (c == "H") {
                    e = this.pickups.newPickup("hook", worldX, worldY, new Rectangle(8, 12, 16, 20));
                }


                if (level.messages[c]) {
                    if (!e) {
                        e = this.pickups.newPickup("message", worldX, worldY, new Rectangle(0,0,32,32), b2BodyType.b2_kinematicBody);
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

    createHorizontalBeam(x: number, y: number, count: number) {
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
    }

    private createGround(x: number, y: number): Entity {
        let t = new PIXI.Texture(this.wallTexture, new Rectangle(64,0,Config.tileSize,Config.tileSize));
        let e = this.physics.createStatic(new PIXI.Rectangle(x, y, Config.tileSize, Config.tileSize));
        let s = e.add(SpriteComponent);
        s.LoadFrame(this.wallTexture, new Rectangle(64, 0, Config.tileSize, Config.tileSize));
        s.sprite.pivot = new Point(0, 0);
        return e;
    }

    advance() {
        // Doesn't advance immediately, waits for update.
        this.loadNextLevel = this.currentLevelIndex + 1;
    }

}