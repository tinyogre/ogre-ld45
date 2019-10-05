import { Point } from "pixi.js";

export class MathUtil {
    static normalize(v: Point): Point {
        return MathUtil.divide(v, MathUtil.len(v));
    }

    static len(v: Point): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    static divide(v: Point, s: number): Point {
        return new Point(v.x / s, v.y / s);
    }
}