import {Component} from "../component"
import { Sprite, Point } from "pixi.js"
import { DebugRenderSystem } from "../systems/DebugRenderSystem";

export class SpriteComponent extends Component {
    static cname = "sprite";
    public sprite: Sprite;

    Load(asset: string): void {
        this.sprite = PIXI.Sprite.from(asset);
    }
}
