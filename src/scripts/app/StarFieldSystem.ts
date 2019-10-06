import { System } from "../engine/System";
import { Rectangle } from "pixi.js";

export class StarFieldSystem extends System {
    static sname: string = "starfield";
    update(deltaTime: number): void {
        
    }

    startGame() {
        let bounds = new Rectangle(-1000, -1000, 3000, 3000);
        let colors: number[] = [
            0xff0000,
            0x00ff00,
            0x0000ff,
            0xffff00,
            0x00ffff,
            0xffffff
        ];
        
        let count = 1000;
        let stage = this.engine.gameStage;
        stage.sortableChildren = true;
        let g = new PIXI.Graphics();
        g.zIndex = -1000;
        for (let i = 0; i < count; i++) {
            g.lineStyle(2, colors[Math.floor(Math.random() * colors.length)]);
            let x = bounds.x + Math.random() * bounds.width;
            let y = bounds.y + Math.random() * bounds.height;
            g.drawStar(
                x, y, 
                4 + Math.floor(Math.random() * 5),
                Math.random() * 0.5);
        }
        stage.addChild(g);
    }
}