
import {System} from "./System";
import { EntityManager } from "./EntityManager";
import { PixiAppWrapper } from "pixi-app-wrapper";
import { EventEmitter } from "events";
import { Container } from "pixi.js";

export interface ISystemType<T extends System> {
    new(...args: any[]): T;
    sname: string;
}

export class Engine {
    events: EventEmitter = new EventEmitter();
    systems: System[] = [];
    systemMap: Map<string, System> = new Map<string, System>();
    app: PixiAppWrapper;
    paused: boolean = false;
    gameStage: Container;
    uiStage: Container;
    static instance: Engine;

    constructor(app: PixiAppWrapper) {
        this.app = app;
        this.entityManager = new EntityManager(this);
        this.gameStage = new Container();
        this.app.stage.addChild(this.gameStage);
        this.uiStage = new Container();
        this.app.stage.addChild(this.uiStage);
        Engine.instance = this;
    }
    
    // I don't know why this isn't just a system too
    public entityManager: EntityManager;

    public update(deltaTime: number) {
        if (!this.paused) {
            this.systems.forEach(s => s.update(deltaTime));
            this.entityManager.update();
        }
    }

    public add<T extends System>(type: ISystemType<T>) : T {
        let s = new type();
        this.systems.push(s)
        this.systemMap.set(type.sname, s);
        s.engine = this;
        return <T>s;
    }

    public get<T extends System>(type: ISystemType<T>) : T {
        return <T>this.systemMap.get(type.sname);
    }
    startGame() {
        this.systems.forEach(s => s.startGame());
    }

    togglePause() {
        this.paused = !this.paused;
    }
}
