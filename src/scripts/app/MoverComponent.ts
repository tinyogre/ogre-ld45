import { Component } from "../engine/component";
import { Point } from "pixi.js";

export class MoverComponent extends Component {
    static cname = "movercomponent;"

    rotateSpeed: number = 0;
    scaleSpeed: number = 0;
    velocity: Point = new Point(0,0);
}