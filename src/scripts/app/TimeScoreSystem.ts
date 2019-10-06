import { System } from "../engine/System";
import { Level } from "./Levels";
import { Point } from "pixi.js";
import { Config } from "./config";
import { GameEvent } from "./GameEvent";


export class TimeScoreSystem extends System {
    static sname = "timescoresystem";

    levelElapsed: number = 0;
    totalElapsed: number = 0;

    levelTimeText: PIXI.Text;
    totalTimeText: PIXI.Text;

    timing: boolean;

    startGame() {
        this.timing = true;
        this.levelTimeText = new PIXI.Text("Level Time: 00:00", { fontFamily: 'Press Start 2P', fontSize: 10, fill: 0xffffff, align: 'right' });
        this.totalTimeText = new PIXI.Text("Total Time: 00:00", { fontFamily: 'Press Start 2P', fontSize: 10, fill: 0xffffff, align: 'right' });
        this.levelTimeText.position = new Point(640 - this.levelTimeText.width, 10);
        this.totalTimeText.position = new Point(640 - this.totalTimeText.width, 20);
        this.levelTimeText.zIndex = 100;
        this.totalTimeText.zIndex = 100;
        this.engine.uiStage.addChild(this.levelTimeText);
        this.engine.uiStage.addChild(this.totalTimeText);

        this.levelElapsed = 0;
        this.totalElapsed = 0;
        this.engine.events.addListener(GameEvent.START_GAME, this.onStartGame.bind(this));
        this.engine.events.addListener(GameEvent.START_LEVEL, this.onStartLevel.bind(this));
        this.engine.events.addListener(GameEvent.GAME_OVER, this.onGameOver.bind(this));
    }

    addToStage(stage: PIXI.Container) {
        if (this.levelTimeText) {
            stage.addChild(this.levelTimeText);
        }

        if (this.totalTimeText) {
            stage.addChild(this.totalTimeText);
        }
    }

    onStartLevel() {
        this.levelElapsed = 0;
    }

    onStartGame() {
        this.timing = true;
        this.totalElapsed = 0;

        this.engine.uiStage.addChild(this.levelTimeText);
        this.engine.uiStage.addChild(this.totalTimeText);
    }
    onGameOver() {
        this.timing = false;
    }

    update(deltaTime: number): void {
        if (this.timing) {
            this.levelElapsed += deltaTime;
            this.totalElapsed += deltaTime;
        }

        this.levelTimeText.text = "Level Time: " + this.getTimeText(this.levelElapsed);
        this.totalTimeText.text = "Total Time: " + this.getTimeText(this.totalElapsed);
    }

    getTimeText(t: number) : string {
        let seconds = t % 60;
        let minutes = Math.floor(t / 60);
        let s = "";
        if (minutes < 10) {
            s = "0" + minutes;
        } else {
            s = "" + minutes;
        }
        s = s + ":";
        if (seconds < 10) {
            s += "0" + seconds;
        } else {
            s += seconds;
        }
        return s;
    }
}