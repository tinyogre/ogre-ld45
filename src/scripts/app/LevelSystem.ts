import { System } from "../engine/System";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { Point, Texture, Rectangle } from "pixi.js";
import { Config } from "./config";
import { PickupSystem } from "./PickupSystem";

export class LevelSystem extends System {
    static sname = "levelsystem";

    wallTexture: PIXI.BaseTexture;
    levelContainer: PIXI.Container;
    physics: PhysicsSystem;
    playerStart: Point;

    l1: string[] = [
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x.........P............................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x.........S......T.....................x",
        "x.......xxxxxxxxxxxxxxxxxxxxxxxx.......x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x......................................x",
        "x...xxxxx...............xxxxxxxxxx.....x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "x.......x...............x..............x",
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ]                                           
    pickups: PickupSystem;
    update(deltaTime: number): void {
    }

    startGame() {
        this.levelContainer = new PIXI.Container();
        this.physics = this.engine.get(PhysicsSystem);
        this.pickups = this.engine.get(PickupSystem);
        this.engine.app.stage.addChild(this.levelContainer);
        this.wallTexture = PIXI.BaseTexture.from("3x3bluewalls");
        this.loadLevel(this.l1);
    }

    loadLevel(level: string[]) {
        for (let y = 0; y < level.length; y++) {
            let row = level[y];
            for (let x = 0; x < row.length; x++) {
                let c = row[x];
                if (c === "P") {
                    this.playerStart = new Point(x * Config.tileSize, y * Config.tileSize);
                } else if (c === "x") {
                    this.addWall(level, x, y);
                } else if (c === "S") {
                    this.pickups.newPickup("star", x * Config.tileSize, y * Config.tileSize, new Rectangle(9, 10, 14, 15));
                } else if (c === "T") {
                    this.pickups.newPickup("engine", x * Config.tileSize, y * Config.tileSize, new Rectangle(8, 25, 16, 7));
                }
            }
        }
    }

    addWall(level: string[], x: number, y: number) {
        this.createGround(x * Config.tileSize, y * Config.tileSize);
    }

    private createGround(x: number, y: number) {
        let t = new PIXI.Texture(this.wallTexture, new Rectangle(64,0,Config.tileSize,Config.tileSize));
        let e = this.physics.createStatic(new PIXI.Rectangle(x, y, Config.tileSize, Config.tileSize));
        let s = e.add(SpriteComponent);
        s.LoadFrame(this.wallTexture, new Rectangle(64, 0, Config.tileSize, Config.tileSize));
        s.sprite.pivot = new Point(0, 0);
    }

}