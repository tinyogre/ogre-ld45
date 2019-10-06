import "pixi.js";
import {
    PixiAppWrapper,
    pixiAppWrapperEvent as WrapperEvent,
    PixiAppWrapperOptions as WrapperOpts,
    Dom,
} from "../third_party/pixi-app-wrapper";
import { PixiAssetsLoader, Asset, AssetPriority, SoundAsset, LoadAsset } from "../third_party/pixi-assets-loader";
import { SCALE_MODES, Point, Rectangle, Sprite, Container } from "pixi.js";
import { Entity } from "../engine/entity";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { SpriteSystem } from "../engine/systems/SpriteSystem";
import { PlayerSystem } from "./PlayerSystem";
import { Engine } from "../engine/Engine";
import { DebugRenderSystem } from "../engine/systems/DebugRenderSystem";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { KeyboardSystem } from "../engine/systems/KeyboardSystem";
import { PickupSystem } from "./PickupSystem";
import { StarFieldSystem } from "./StarFieldSystem";
import { ParticleSystem } from "../engine/systems/ParticleSystem";
import { LevelSystem } from "./LevelSystem";
import { MessageSystem } from "./MessageSystem";
import { TtlSystem } from "./TtlSystem";
import { GameEvent } from "./GameEvent";
import { SoundSystem } from "./SoundSystem";
import { MoverSystem } from "./MoverSystem";

export class StarTwit {
    app: PixiAppWrapper;
    loader: PixiAssetsLoader;
    splash_screen: Container;

    assets: Asset[] = [
        {id: "title_screen", url: "assets/gfx/title_screen.png", priority: AssetPriority.HIGHEST, type: "texture" },
        // {id: "press_start_2p", url: "assets/fonts/PressStart2p.ttf", priority: AssetPriority.HIGHEST, type: "font" },
        // {id: "ship", url: "assets/gfx/ship.png", priority: AssetPriority.HIGH, type: "texture"},
        // { id: "star", url: "assets/gfx/star.png", priority: AssetPriority.HIGH, type: "texture" },
        // { id: "engine", url: "assets/gfx/engine.png", priority: AssetPriority.HIGH, type: "texture" },
        // { id: "ground", url: "assets/gfx/ground.png", priority: AssetPriority.HIGH, type: "texture" },
    ];

    soundAssets: string[] = [
        "collision01_s",
        "collision02_s",
        "collision03_s",
        "explosion01_s",
        "explosion02_s",
        "explosion03_s",
        "message01_s",
        "message02_s",
        "message03_s",
        "powerup01_s",
        "powerup02_s",
        "powerup03_s",
        "powerup04_s",
        "shoot01_s",
        "thrust01_s",
        "thrust02_s",
        "wormhole01_s",
    ];

    gameTextures: string[] = [
        "ship",
        "star",
        "engine",
        "ground001",
        "thrustparticle",
        "3x3bluewalls",
        "wormhole",
        "wormholeswirl",
        "wormholespark",
        "turret",
        "bouncyball",
        "physicstile",
        "hook",
        "narrowhorizontaltunnel",
        "button_unpressed",
        "button_pressed",
        "explodingcrate",
        "explosion",
    ]
    
    engine: Engine;
    statusText: PIXI.Text;
    firstTime: boolean = true;
    soundSystem: SoundSystem;
    keyboard: KeyboardSystem;
    inGame: boolean = false;
    enableLevelCheat = true;

    static CANVAS_SIZE: Point = new Point(640, 480);

    constructor() {
        const canvas = Dom.getElementOrCreateNew<HTMLCanvasElement>("app-canvas", "canvas", document.getElementById("app-root"));

        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.TARGET_FPMS = 60 / 1000;
        
        let type = "WebGL";
        if (!PIXI.utils.isWebGLSupported()) {
            type = "canvas";
        }
        PIXI.utils.sayHello(type);

        this.app = new PixiAppWrapper({width: StarTwit.CANVAS_SIZE.x, height: StarTwit.CANVAS_SIZE.y, resolution: 2, view: canvas});
        this.app.renderer.backgroundColor = 0x000040;
        this.loader = new PixiAssetsLoader();
        this.loader.on(PixiAssetsLoader.PRIORITY_GROUP_LOADED, this.onAssetsLoaded.bind(this));
        for (let s of this.soundAssets) {
            let sa: SoundAsset = { id: s, url: "assets/sfx/" + s + ".wav", priority: AssetPriority.HIGH, autoplay: false, loop: false, rate: 1, type: "sound" };
            this.assets.push(sa);
        }

        for (let g of this.gameTextures) {
            let a: Asset = { id: g, url: "assets/gfx/" + g + ".png", priority: AssetPriority.HIGH, type: "texture" }; 
            this.assets.push(a);
        }
        this.loader.addAssets(this.assets).load();

        this.engine = new Engine(this.app);
        
        this.keyboard = this.engine.add(KeyboardSystem);
        this.engine.add(PhysicsSystem);
        this.engine.add(SpriteSystem);
        this.engine.add(PickupSystem);
        this.engine.add(LevelSystem);
        this.engine.add(PlayerSystem);
        this.engine.add(StarFieldSystem);
        this.engine.add(ParticleSystem);
        this.engine.add(MessageSystem);
        this.engine.add(TtlSystem);
        this.engine.add(MoverSystem);
        this.soundSystem = this.engine.add(SoundSystem);

        let debugRenderSystem = this.engine.add(DebugRenderSystem);
        debugRenderSystem.stage = this.engine.gameStage;

        this.engine.events.addListener(GameEvent.GAME_OVER, this.onGameOver.bind(this));
        this.engine.events.addListener(GameEvent.GAME_WON, this.onGameWon.bind(this));
    }

    private startGame(level: number) {
        this.inGame = true;
        if (this.firstTime) {
            this.engine.startGame();
            this.app.ticker.add((dt) => this.update(dt));
            this.firstTime = false;
        }
        this.engine.get(LevelSystem).currentLevelIndex = -1;
        this.engine.get(LevelSystem).loadNextLevel = level;
    }

    private createGround(physics: PhysicsSystem, x: number, y: number) {
        let e = physics.createStatic(new PIXI.Rectangle(x, y, 320, 10));
        let s = e.add(SpriteComponent);
        s.Load("ground001");
        s.sprite.pivot = new Point(0, 0);
    }

    private startMenu() {
        this.inGame = false;
        this.splash_screen = new PIXI.Container();
        let art = PIXI.Sprite.from('title_screen');
        this.splash_screen.addChild(art);
        //art.scale = new Point(2,2);
        this.app.stage.addChild(this.splash_screen);
        this.statusText = new PIXI.Text("Loading...", {fontFamily: 'Press Start 2P', fontSize: 10, fill: 0xffaa77, align: 'center'});
        //this.statusText = new PIXI.Text("Loading...", { fontFamily: 'Courier', fontSize: 14, fill: 0xffffff, align: 'center' });
        this.splash_screen.addChild(this.statusText);
        this.statusText.position = new Point(320 - this.statusText.width / 2, 300);
    }

    private exitMenu(toLevel: number) {
        this.app.renderer.plugins.interaction.removeAllListeners();
        this.app.stage.removeChild(this.splash_screen);
        this.startGame(toLevel);
    }

    private onMenuClick() {
        this.exitMenu(5);
    }

    private onGameOver() {
        this.startMenu();
        this.onReady();
    }

    private onGameWon() {
        this.enableLevelCheat = true;
    }

    private onReady() {
        if (this.enableLevelCheat) {
            this.statusText.text = "Click to Start, or 1-6 on keyboard to jump to level";
        } else {
            this.statusText.text = "Click to Start"; 5
        }
        this.statusText.position = new Point(320 - this.statusText.width / 2, 320);

        if (this.firstTime) {
            this.keyboard.addKeyDown(this.keyDown.bind(this));
        }
        let fn = this.onMenuClick.bind(this);
        this.app.renderer.plugins.interaction.on('pointerup', fn);
    }

    keyDown(key: number) {
        if (this.inGame || !this.enableLevelCheat) {
            return;
        }
        if (key >= "1".charCodeAt(0) && key <= "6".charCodeAt(0)) {
            let levelIndex = key - "1".charCodeAt(0);
            this.exitMenu(levelIndex);
        }
    }
    //The `randomInt` helper function
    randomInt(min: number, max: number) : number{
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private update(deltaLunacy: number) {
        // Pixi.js's "delta time" was created by a lunatic.  Convert it into
        // a saner seconds passed deltaTime.
        let deltaTime = (deltaLunacy / PIXI.settings.TARGET_FPMS) / 1000;
        this.engine.update(deltaTime);
    }

    private onAssetsLoaded(args: { priority: number, assets: LoadAsset[] }): void {
        args.assets.forEach(loadAsset => {
            if (loadAsset.asset.type === "sound" && loadAsset.loaded) {
                this.soundSystem.add(loadAsset.asset.id, (loadAsset.asset as SoundAsset).howl!);
            }
        });

        if (args.priority === AssetPriority.HIGHEST) {
            this.startMenu();
        }
        if (args.priority === AssetPriority.HIGH) {
            this.onReady();
        }
    }
}

