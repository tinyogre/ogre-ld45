import { Component } from "../component";

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
}