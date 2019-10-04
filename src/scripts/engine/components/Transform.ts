import { Point } from "pixi.js";
import { Component } from "../component";

export class Transform extends Component {
    static cname = "transform";
    pos: Point = new Point(0,0);
    rotation: number = 0;
    scale: number = 1;
}