import { Component } from "../component";
import { b2Body } from "@flyover/box2d";

export class PhysicsComponent extends Component {
    static cname = "physics";
    body: b2Body;
    bounds: PIXI.Rectangle;
}
