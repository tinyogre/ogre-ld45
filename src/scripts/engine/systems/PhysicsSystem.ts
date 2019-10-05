import {b2World, b2Vec2, b2Body, b2BodyDef, b2PolygonShape, b2BodyType, XY, b2FixtureDef, b2ContactListener, b2Contact, b2ParticleSystem, b2ParticleBodyContact, b2ParticleContact, b2Manifold, b2ContactImpulse} from "@flyover/box2d";
import {System} from "../System";
import { Transform } from "../components/Transform"
import { EntityManager } from "../EntityManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { DebugRenderSystem } from "./DebugRenderSystem";
import { Point, Rectangle } from "pixi.js";
import { Entity } from "../entity";
import { Config } from "../../app/config"

// class ContactListener extends b2ContactListener {
//     physics: PhysicsSystem;

//     constructor(physics: PhysicsSystem) {
//         super();
//         this.physics = physics;
//     }

//     public BeginContact(contact: b2Contact) {
//         console.log("Contact!");
//     }

//     public EndContact(contact: b2Contact) {
//         console.log("End Contact!");
//     }
// }

export class xxxContactListener {
    /// Called when two fixtures begin to touch.
    public BeginContact(contact: b2Contact): void { 
        console.log("BeginContext");
    }

    /// Called when two fixtures cease to touch.
    public EndContact(contact: b2Contact): void { }

    // #if B2_ENABLE_PARTICLE
    public BeginContactFixtureParticle(system: b2ParticleSystem, contact: b2ParticleBodyContact): void { }
    public EndContactFixtureParticle(system: b2ParticleSystem, contact: b2ParticleBodyContact): void { }
    public BeginContactParticleParticle(system: b2ParticleSystem, contact: b2ParticleContact): void { }
    public EndContactParticleParticle(system: b2ParticleSystem, contact: b2ParticleContact): void { }
    // #endif

    /// This is called after a contact is updated. This allows you to inspect a
    /// contact before it goes to the solver. If you are careful, you can modify the
    /// contact manifold (e.g. disable contact).
    /// A copy of the old manifold is provided so that you can detect changes.
    /// Note: this is called only for awake bodies.
    /// Note: this is called even when the number of contact points is zero.
    /// Note: this is not called for sensors.
    /// Note: if you set the number of contact points to zero, you will not
    /// get an EndContact callback. However, you may get a BeginContact callback
    /// the next step.
    public PreSolve(contact: b2Contact, oldManifold: b2Manifold): void { }

    /// This lets you inspect a contact after the solver is finished. This is useful
    /// for inspecting impulses.
    /// Note: the contact manifold does not include time of impact impulses, which can be
    /// arbitrarily large if the sub-step is small. Hence the impulse is provided explicitly
    /// in a separate data structure.
    /// Note: this is only called for contacts that are touching, solid, and awake.
    public PostSolve(contact: b2Contact, impulse: b2ContactImpulse): void { }

    public static readonly b2_defaultListener: b2ContactListener = new b2ContactListener();
}

export class PhysicsSystem extends System {
    static sname = "physics";
    world: b2World;
    ground: b2Body;
    debug: boolean;
    contactListener: b2ContactListener;

    constructor() {
        super();
        let gravity: b2Vec2 = new b2Vec2(0, Config.gravity);
        this.world = new b2World(gravity);
        this.contactListener = new xxxContactListener();
        this.world.SetContactListener(this.contactListener);
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

    private scaleShape(shape:XY[]) : XY[] {
        let ret:XY[] = [];
        for (let p of shape) {
            let scaled = { x: p.x * Config.physicsScale, y: p.y * Config.physicsScale};
            ret.push(scaled);
        }
        return ret;
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

    getBounds(verts: XY[]): Rectangle {
        let min: XY = new b2Vec2(verts[0].x, verts[0].y);
        let max: XY = new b2Vec2(verts[0].x, verts[0].y);
        for (let p of verts) {
            if (p.x < min.x) {
                min.x = p.x;
            }
            if (p.y < min.y) {
                min.y = p.y;
            }
            if (p.x > max.x) {
                max.x = p.x;
            }
            if (p.y > max.y) {
                max.y = p.y;
            }
        }
        return new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
    }

    private addShapeInternal(unscaled: XY[], type: b2BodyType, pc: PhysicsComponent, t: Transform) {
        let verts = this.scaleShape(unscaled);
        let def = new b2BodyDef();
        def.type = type;
        def.position.Set(0, 0);
        pc.body = this.world.CreateBody(def);
        let box = new b2PolygonShape();
        // let verts:XY[] = [
        //     {x: 0, y: 0},
        //     {x: r.width, y: 0},
        //     {x: r.width, y: r.height},
        //     {x: 0, y: r.height}
        // ];
        box.Set(verts);
        //box.SetAsBox(r.width/2, r.height/2, new b2Vec2(r.width / 2, r.height / 2));
        pc.bounds = this.unscaleRect(this.getBounds(verts)); //this.unscaleRect(new PIXI.Rectangle(0, 0, r.width, r.height));
        pc.shape = this.getPoints(unscaled);
        let fd = new b2FixtureDef();
        fd.shape = box;
        fd.density = 1.0;
        fd.friction = 0.3;
        let fixture = pc.body.CreateFixture(fd);
        let tPos = this.scalePoint(t.pos);
        pc.body.SetTransformXY((t.pos.x + pc.bounds.x) * Config.physicsScale, (t.pos.y + pc.bounds.y) * Config.physicsScale, t.rotation);
    }
    getPoints(unscaled: XY[]): Point[] {
        let p: Point[] = [];
        for (let xy of unscaled) {
            p.push(new Point(xy.x, xy.y));
        }
        return p;
    }

    private addBoxInternal(r: PIXI.Rectangle, type: b2BodyType, pc: PhysicsComponent, t: Transform) {
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
        this.addShapeInternal(verts, type, pc, t);
    }

    public addShape(e: Entity, shape: XY[]) {
        let pc = e.getOrAdd(PhysicsComponent);
        let t = e.get(Transform);
        this.addShapeInternal(shape, b2BodyType.b2_dynamicBody, pc, t);
    }

    createStatic(r: PIXI.Rectangle): Entity {
        let e = this.engine.entityManager.createEntity();
        let pc = e.add(PhysicsComponent);
        let t = e.add(Transform);
        t.pos = new Point(r.x, r.y);
        let rr = new PIXI.Rectangle(0, 0, r.width, r.height);
        this.addBoxInternal(rr, b2BodyType.b2_staticBody, pc, t);
        return e;
    }

    addBox(e: Entity, rect: PIXI.Rectangle) {
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
                //drs.addBox(e, new Point(pc.bounds.left, pc.bounds.top), 
                //    new Point(pc.bounds.width, pc.bounds.height), 0xff00ff);
                drs.addShape(e, pc.shape, 0xff00ff);
            } else {
                drs.remove(e);
            }
        }
    }
}