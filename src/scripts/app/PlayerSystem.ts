
import {System} from "../engine/System";
import { SpriteComponent } from "../engine/components/SpriteComponent";
import { Transform } from "../engine/components/Transform";
import { Point, Rectangle } from "pixi.js";
import { PhysicsSystem } from "../engine/systems/PhysicsSystem";
import { Entity } from "../engine/entity";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { b2Vec2 } from "@flyover/box2d";
import { KeyboardSystem } from "../engine/systems/KeyboardSystem";
import { Config } from "./config";
import {StandardGamepad, StandardGamepadMapping, StandardGamepadButton} from "../third_party/standard-gamepad";

export class PlayerSystem extends System {
    static sname: string = "player";
    player: Entity;
    keyboard: KeyboardSystem;
    mapping: StandardGamepadMapping = new StandardGamepadMapping();
    gamepad: StandardGamepad = new StandardGamepad(navigator, window, this.mapping);
    
    startGame() {
        this.keyboard = this.engine.get(KeyboardSystem);
        let physics = this.engine.get(PhysicsSystem);
        this.player = this.engine.entityManager.createEntity();
        var sprite = this.player.add(SpriteComponent);
        var transform = this.player.add(Transform);
        transform.pos = new Point(160, 0);
        transform.rotation = 0;
        physics.addBox(this.player, new Rectangle(-16, -16, 32, 32));
        sprite.Load('lander');
        sprite.sprite.pivot = new Point(16, 16);
        //sprite.sprite.pivot = transform.pivot;
        this.engine.app.stage.addChild(this.player.get(SpriteComponent).sprite);

        this.gamepad.onConnected(() => { console.log("Gamepad connected!")});
        this.gamepad.enable();
    }

    static rotate(v: b2Vec2, r: number): b2Vec2 {
        let out = new b2Vec2;
        return b2Vec2.RotateV(v, r, out);
    }

    update(deltaTime: number): void {
        let rotate: number = 0;
        let pc = this.player.get(PhysicsComponent);
        let t = this.player.get(Transform);
        let buttons = this.gamepad.getPressedButtons();
        let joystick: any = this.gamepad.getJoystickPositions();
        let leftStick: Point = new Point(0,0);
        if (joystick && joystick.left) {
            leftStick = new Point(joystick.left.horizontal, joystick.left.vertical);
        }

        if (this.keyboard.isKeyDown(87, 38) || buttons.includes(StandardGamepadButton.A)) {
            pc.body.ApplyForce(PlayerSystem.rotate(new b2Vec2(0, -1000), t.rotation), pc.body.GetWorldCenter());
        }
        if (this.keyboard.isKeyDown(65, 37) || leftStick.x < -0.5) {
            rotate -= 1;
        }
        if (this.keyboard.isKeyDown(68, 39) || leftStick.x > 0.5) {
            rotate += 1;
        }
        if (rotate !== 0) {
          pc.body.ApplyTorque(rotate * 1000);
        }

        this.engine.app.stage.position = new Point(-t.pos.x + 160, -t.pos.y + 120);
    }
}