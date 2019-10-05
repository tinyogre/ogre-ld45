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

export class LevelSystem extends System {
    static sname = "levelsystem";

    wallTexture: PIXI.BaseTexture;
    levelContainer: PIXI.Container;
    physics: PhysicsSystem;
    playerStart: Point;
    currentLevelIndex: number = -1;
    loadNextLevel: number = 0;
    levels: Level[] = [
        Levels.level1,
        Levels.level2,
    ];
    particles: ParticleSystem;
    pickups: PickupSystem;

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
                    e = this.pickups.newPickup("wormhole", worldX, worldY, new Rectangle(0, 0, 64, 64), b2BodyType.b2_kinematicBody);
                    this.particles.addParticleEmitter(e, ParticleDef.WORMHOLE);
                }
                if (e) {
                    e.getOrAdd(LevelObjectComponent);
                }
            }
        }

        this.engine.events.emit(GameEvent.START_LEVEL, level)
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