import "pixi.js";
import {
    PixiAppWrapper,
    pixiAppWrapperEvent as WrapperEvent,
    PixiAppWrapperOptions as WrapperOpts,
} from "../third_party/pixi-app-wrapper";
import { PixiAssetsLoader, Asset, AssetPriority, SoundAsset, LoadAsset } from "../third_party/pixi-assets-loader";
import { SCALE_MODES, Point, Rectangle, Sprite } from "pixi.js";
import { Entity } from "../engine/entity";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { SpriteSystem } from "../engine/systems/SpriteSystem";
import { PlayerSystem } from "./PlayerSystem";
import { Engine } from "../engine/Engine";
import { DebugRenderSystem } from "../engine/systems/DebugRenderSystem";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { KeyboardSystem } from "../engine/systems/KeyboardSystem";

export class OgreLanderTestApp {
    app: PixiAppWrapper;
    loader: PixiAssetsLoader;
    splash_screen: Sprite;

    assets: Asset[] = [
        {id: "splash_screen", url: "assets/gfx/splash_screen.png", priority: AssetPriority.HIGHEST, type: "texture" },
        {id: "press_start_2p", url: "assets/fonts/PressStart2p.ttf", priority: AssetPriority.HIGHEST, type: "font" },
        {id: "lander", url: "assets/gfx/lander.png", priority: AssetPriority.HIGH, type: "texture"},
    ];
    sound: Howl;
    engine: Engine;
        
    constructor() {
        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.TARGET_FPMS = 60 / 1000;
        let type = "WebGL";
        if (!PIXI.utils.isWebGLSupported()) {
            type = "canvas";
        }
        PIXI.utils.sayHello(type);

        this.app = new PixiAppWrapper({width: 320, height: 240, resolution: 4});
        this.app.renderer.backgroundColor = 0x000040;
        this.loader = new PixiAssetsLoader();
        this.loader.on(PixiAssetsLoader.PRIORITY_GROUP_LOADED, this.onAssetsLoaded.bind(this));
        this.loader.addAssets(this.assets).load();

        this.engine = new Engine(this.app);
        
        this.engine.add(KeyboardSystem);
        this.engine.add(PhysicsSystem);
        this.engine.add(SpriteSystem);
        this.engine.add(PlayerSystem);
        let debugRenderSystem = this.engine.add(DebugRenderSystem);
        debugRenderSystem.stage = this.app.stage;
    }

    private startGame() {
        let physics:PhysicsSystem = this.engine.get(PhysicsSystem);
        let e = physics.createStatic(new PIXI.Rectangle(0, 230, 320, 10));

        this.engine.startGame();
        this.app.ticker.add((dt) => this.update(dt));

        let p = this.engine.get(PhysicsSystem);
        if (p) {
            p.setDebug(true);
        }
    }

    private startMenu() {
        this.splash_screen = PIXI.Sprite.from('splash_screen');
        this.app.stage.addChild(this.splash_screen);
        let text = new PIXI.Text("Loading...", {fontFamily: 'Press Start 2P', fontSize: 8, fill: 0xffffff, align: 'center'});
        this.splash_screen.addChild(text);
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
            let fn = this.onMenuClick.bind(this);
            this.app.renderer.plugins.interaction.on('pointerup', fn);
        }
    }
}

