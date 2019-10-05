import {Component} from "../component"
import { Sprite, Point } from "pixi.js"
import { DebugRenderSystem } from "../systems/DebugRenderSystem";

export class SpriteComponent extends Component {
    static cname = "sprite";
    public sprite: Sprite;
    public asset: string;
    Load(asset: string): void {
        this.asset = asset;
        this.sprite = PIXI.Sprite.from(asset);
        this.entity.engine.app.stage.addChild(this.sprite);
    }

    onDelete() {
        if (this.sprite) {
            //this.sprite.parent.removeChild(this.sprite);
            this.sprite.destroy();
        }
    }
}
