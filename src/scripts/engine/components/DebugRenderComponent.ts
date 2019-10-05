import { Component } from "../component";
import { Stage } from "pixi-layers";

export class DebugRenderComponent extends Component {
    static cname = "debugrender";
    g: PIXI.Graphics;
    added: boolean;
    addToStage(stage: PIXI.Container) {
        if (!this.added) {
            stage.addChild(this.g);
            this.added = true;
        }
    }

    removeFromStage(stage: PIXI.Container) {
        if (this.added) {
            stage.removeChild(this.g);
            this.added = false;
        }
    }

    onDelete() {
        if (this.added) {
            this.g.parent.removeChild(this.g);
            this.added = false;
        }
    }
}