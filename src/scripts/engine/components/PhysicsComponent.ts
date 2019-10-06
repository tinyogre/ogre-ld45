import { Component } from "../component";
import { b2Body } from "@flyover/box2d";

export class PhysicsComponent extends Component {
    static cname = "physics";
    body: b2Body;
    bounds: PIXI.Rectangle;
    shape: PIXI.Point[];
    contactListener?: (self: PhysicsComponent, other: PhysicsComponent) => void;
    fixedVisualRotation: boolean = false;
    
    // Hack for that level with a few hundred physics objects.
    silent: boolean;

    onDelete() {
        if (this.body) {
            this.body.m_world.DestroyBody(this.body);
            this.body = null as unknown as b2Body;
        }
    }
}
