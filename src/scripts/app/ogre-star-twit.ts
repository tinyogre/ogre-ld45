import "pixi.js";
import {
    PixiAppWrapper,
    pixiAppWrapperEvent as WrapperEvent,
    PixiAppWrapperOptions as WrapperOpts,
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

export class StarTwit {
    app: PixiAppWrapper;
    loader: PixiAssetsLoader;
    splash_screen: Container;

    assets: Asset[] = [
        {id: "splash_screen", url: "assets/gfx/splash_screen.png", priority: AssetPriority.HIGHEST, type: "texture" },
        // {id: "press_start_2p", url: "assets/fonts/PressStart2p.ttf", priority: AssetPriority.HIGHEST, type: "font" },
        // {id: "ship", url: "assets/gfx/ship.png", priority: AssetPriority.HIGH, type: "texture"},
        // { id: "star", url: "assets/gfx/star.png", priority: AssetPriority.HIGH, type: "texture" },
        // { id: "engine", url: "assets/gfx/engine.png", priority: AssetPriority.HIGH, type: "texture" },
        // { id: "ground", url: "assets/gfx/ground.png", priority: AssetPriority.HIGH, type: "texture" },
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
    ]
    
    sound: Howl;
    engine: Engine;
    statusText: PIXI.Text;
    static CANVAS_SIZE: Point = new Point(640, 480);

    constructor() {
        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.TARGET_FPMS = 60 / 1000;
        
        let type = "WebGL";
        if (!PIXI.utils.isWebGLSupported()) {
            type = "canvas";
        }
        PIXI.utils.sayHello(type);

        this.app = new PixiAppWrapper({width: StarTwit.CANVAS_SIZE.x, height: StarTwit.CANVAS_SIZE.y, resolution: 2});
        this.app.renderer.backgroundColor = 0x000040;
        this.loader = new PixiAssetsLoader();
        this.loader.on(PixiAssetsLoader.PRIORITY_GROUP_LOADED, this.onAssetsLoaded.bind(this));
        for (let g of this.gameTextures) {
            let a: Asset = { id: g, url: "assets/gfx/" + g + ".png", priority: AssetPriority.HIGH, type: "texture" }; 
            this.assets.push(a);
        }
        this.loader.addAssets(this.assets).load();

        this.engine = new Engine(this.app);
        
        this.engine.add(KeyboardSystem);
        this.engine.add(PhysicsSystem);
        this.engine.add(SpriteSystem);
        this.engine.add(PickupSystem);
        this.engine.add(LevelSystem);
        this.engine.add(PlayerSystem);
        this.engine.add(StarFieldSystem);
        this.engine.add(ParticleSystem);
        this.engine.add(MessageSystem);
        this.engine.add(TtlSystem);
        
        let debugRenderSystem = this.engine.add(DebugRenderSystem);
        debugRenderSystem.stage = this.engine.gameStage;
    }

    private startGame() {
        let physics:PhysicsSystem = this.engine.get(PhysicsSystem);
        // this.createGround(physics, 0, 470);
        // this.createGround(physics, 320, 470);
        // this.createGround(physics, -320, 470);

        this.engine.startGame();
        this.app.ticker.add((dt) => this.update(dt));

        let p = this.engine.get(PhysicsSystem);
        //p.setDebug(true);
    }

    private createGround(physics: PhysicsSystem, x: number, y: number) {
        let e = physics.createStatic(new PIXI.Rectangle(x, y, 320, 10));
        let s = e.add(SpriteComponent);
        s.Load("ground001");
        s.sprite.pivot = new Point(0, 0);
    }

    private startMenu() {
        this.splash_screen = new PIXI.Container();
        let art = PIXI.Sprite.from('splash_screen');
        this.splash_screen.addChild(art);
        art.scale = new Point(2,2);
        this.app.stage.addChild(this.splash_screen);
        this.statusText = new PIXI.Text("Loading...", {fontFamily: 'Press Start 2P', fontSize: 10, fill: 0xffffff, align: 'center'});
        //this.statusText = new PIXI.Text("Loading...", { fontFamily: 'Courier', fontSize: 14, fill: 0xffffff, align: 'center' });
        this.splash_screen.addChild(this.statusText);
    }

    private onMenuClick() {
        this.app.renderer.plugins.interaction.removeAllListeners();
        this.app.stage.removeChild(this.splash_screen);
        this.startGame();
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
        window.console.log(`[SAMPLE APP] onAssetsLoaded ${args.assets.map(loadAsset => loadAsset.asset.id)}`);

        args.assets.forEach(loadAsset => {
            if (loadAsset.asset.id === "sound1" && loadAsset.loaded) {
                this.sound = (loadAsset.asset as SoundAsset).howl!;
            }
        });

        if (args.priority === AssetPriority.HIGHEST) {
            this.startMenu();
        }
        if (args.priority === AssetPriority.HIGH) {
            this.statusText.text = "Click to Start";
            let fn = this.onMenuClick.bind(this);
            this.app.renderer.plugins.interaction.on('pointerup', fn);
        }
    }
}

