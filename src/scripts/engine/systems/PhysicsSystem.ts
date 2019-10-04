import {b2World, b2Vec2, b2Body, b2BodyDef, b2PolygonShape, b2BodyType, XY, b2FixtureDef} from "@flyover/box2d";
import {System} from "../System";
import { Transform } from "../components/Transform"
import { EntityManager } from "../EntityManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { DebugRenderSystem } from "./DebugRenderSystem";
import { Point, Rectangle } from "pixi.js";
import { Entity } from "../entity";
import { Config } from "../../app/config"

export class PhysicsSystem extends System {
    static sname = "physics";
    world: b2World;
    ground: b2Body;
    debug: boolean;

    constructor() {
        super();
        let gravity: b2Vec2 = new b2Vec2(0, Config.gravity);
        this.world = new b2World(gravity);
    }

    update(deltaTime: number) {
        this.world.Step(deltaTime, 1, 1);
        let es = this.engine.entityManager.getAll(PhysicsComponent);
        for (let e of es) {
            var pc = e.get(PhysicsComponent);
            var t = e.get(Transform);
            let b2pos = pc.body.GetPosition();
            let b2rotation = pc.body.GetAngle();
            let p = this.unscalePoint(new Point(b2pos.x, b2pos.y));
            t.pos = new Point(p.x, p.y);
            t.rotation = b2rotation;
        }
    }

    private scaleRect(r: Rectangle) : Rectangle {
        return new Rectangle(
            r.x * Config.physicsScale,
            r.y * Config.physicsScale,
            r.width * Config.physicsScale,
            r.height * Config.physicsScale);
    }

    private scalePoint(p: Point) : Point {
        return new Point(p.x * Config.physicsScale, p.y * Config.physicsScale);
    }

    private unscaleRect(r: Rectangle) : Rectangle {
        return new Rectangle(
            r.x / Config.physicsScale,
            r.y / Config.physicsScale,
            r.width / Config.physicsScale,
            r.height / Config.physicsScale);
    }

    private unscalePoint(p: Point): Point {
        return new Point(p.x / Config.physicsScale, p.y / Config.physicsScale);
    }

    private addBoxInternal(r: PIXI.Rectangle, type: b2BodyType, pc: PhysicsComponent, t: Transform) {
        let def = new b2BodyDef();
        def.type = type;
        def.position.Set(0, 0);
        pc.body = this.world.CreateBody(def);
        let box = new b2PolygonShape();
        let verts:XY[] = [
            {x: 0, y: 0},
            {x: r.width, y: 0},
            {x: r.width, y: r.height},
            {x: 0, y: r.height}
        ];
        for(let v of verts) {
            v.x += r.left;
            v.y += r.top;
        }
        // let verts:XY[] = [
        //     {x: 0, y: 0},
        //     {x: r.width, y: 0},
        //     {x: r.width, y: r.height},
        //     {x: 0, y: r.height}
        // ];
        box.Set(verts);
        //box.SetAsBox(r.width/2, r.height/2, new b2Vec2(r.width / 2, r.height / 2));
        pc.bounds = this.unscaleRect(r); //this.unscaleRect(new PIXI.Rectangle(0, 0, r.width, r.height));
        let fd = new b2FixtureDef();
        fd.shape = box;
        fd.density = 1.0;
        fd.friction = 0.3;
        let fixture = pc.body.CreateFixture(fd);
        let tPos = this.scalePoint(t.pos);
        pc.body.SetTransformXY((t.pos.x + pc.bounds.x) * Config.physicsScale, (t.pos.y + pc.bounds.y) * Config.physicsScale, t.rotation);
    }

    createStatic(r: PIXI.Rectangle): Entity {
        let e = this.engine.entityManager.createEntity();
        let pc = e.add(PhysicsComponent);
        let t = e.add(Transform);
        t.pos = new Point(r.x, r.y);
        let rr = new PIXI.Rectangle(0, 0, r.width, r.height);
        this.addBoxInternal(this.scaleRect(rr), b2BodyType.b2_staticBody, pc, t);
        return e;
    }

    addBox(e: Entity, rect: PIXI.Rectangle) {
        rect = this.scaleRect(rect);
        let pc = e.getOrAdd(PhysicsComponent);
        let t = e.get(Transform);
        this.addBoxInternal(rect, b2BodyType.b2_dynamicBody, pc, t);
    }

    setDebug(debug: boolean) {
        if (debug === this.debug) {
            return;
        }
        var comps = EntityManager.instance.getAll(PhysicsComponent);
        let drs = this.engine.get(DebugRenderSystem);
        if (drs == null) {
            return;
        }
        for (let e of comps) {
            let pc = e.get(PhysicsComponent);
            if (debug) {
                drs.addBox(e, new Point(pc.bounds.left, pc.bounds.top), 
                    new Point(pc.bounds.width, pc.bounds.height), 0xff00ff);
            } else {
                drs.remove(e);
            }
        }
    }
}