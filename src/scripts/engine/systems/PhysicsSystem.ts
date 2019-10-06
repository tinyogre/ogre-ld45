import {b2World, b2Vec2, b2Body, b2BodyDef, b2PolygonShape, b2BodyType, XY, b2FixtureDef, b2ContactListener, b2Contact, b2ParticleSystem, b2ParticleBodyContact, b2ParticleContact, b2Manifold, b2ContactImpulse, b2Shape, b2CircleShape, b2Fixture, b2JointDef, b2WeldJointDef, b2Joint, b2WorldManifold, b2DistanceJointDef} from "@flyover/box2d";
import {System} from "../System";
import { Transform } from "../components/Transform"
import { EntityManager } from "../EntityManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { DebugRenderSystem } from "./DebugRenderSystem";
import { Point, Rectangle } from "pixi.js";
import { Entity } from "../entity";
import { Config } from "../../app/config"
import { SoundSystem } from "../../app/SoundSystem";

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

class FixtureObserver {
    fn: (fixtureA: b2Fixture, a: Entity, fixtureB: b2Fixture, b: Entity) => void;
}

export class AppContactListener {
    sounds: SoundSystem;
    constructor(sounds: SoundSystem) {
        this.sounds = sounds;
    }

    /// Called when two fixtures begin to touch.
    public BeginContact(contact: b2Contact): void { 
        let fixtureA = contact.m_fixtureA;
        let fixtureB = contact.m_fixtureB;
        let a = fixtureA.GetBody().m_userData as PhysicsComponent;
        let b = fixtureB.GetBody().m_userData as PhysicsComponent;

        if (!a.silent && !b.silent) {
            if (!fixtureA.IsSensor() && !fixtureB.IsSensor()) {
                this.sounds.playFromList(SoundSystem.collisionSounds);
            }
        }

        let manifold = new b2WorldManifold();
        contact.GetWorldManifold(manifold);

        let fixtureAObserver = fixtureA.m_userData as FixtureObserver;
        if (fixtureAObserver) {
            fixtureAObserver.fn(fixtureA, a.entity, fixtureB, b.entity);
        }

        let fixtureBObserver = fixtureB.m_userData as FixtureObserver;
        if (fixtureBObserver) {
            fixtureBObserver.fn(fixtureB, b.entity, fixtureA, a.entity);
        }

        //console.log("BeginContact(" + a.entity.debugName + " => " + b.entity.debugName + ")");
        if (a.contactListener) {
            a.contactListener(a, b);
        }
        if (b.contactListener) {
            b.contactListener(b, a);
        }
    }

    /// Called when two fixtures cease to touch.
    public EndContact(contact: b2Contact): void { 
        //console.log("End Contact");
    }

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
    debug: boolean = false;
    contactListener: b2ContactListener;

    constructor() {
        super();
    }

    startGame() {
        let gravity: b2Vec2 = new b2Vec2(0, Config.gravity);
        this.world = new b2World(gravity);
        this.contactListener = new AppContactListener(this.engine.get(SoundSystem));
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
            if (!pc.fixedVisualRotation) {
                t.rotation = b2rotation;
            }
        }
    }

    private scaleDistance(d: number): number {
        return d * Config.physicsScale;
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

    private addPolygonInternal(unscaled: XY[], type: b2BodyType, pc: PhysicsComponent, t: Transform): b2Fixture {
        let verts = this.scaleShape(unscaled);
        let poly = new b2PolygonShape();
        poly.Set(verts);
        pc.bounds = this.unscaleRect(this.getBounds(verts)); //this.unscaleRect(new PIXI.Rectangle(0, 0, r.width, r.height));
        pc.shape = this.getPoints(unscaled);
        return this.addShapeInternal(poly, type, pc, t);
    }

    private addShapeInternal(shape: b2Shape, type: b2BodyType, pc: PhysicsComponent, t: Transform): b2Fixture {
        if (!pc.body) {
            let def = new b2BodyDef();
            def.type = type;
            def.position.Set(0, 0);
            pc.body = this.world.CreateBody(def);
            pc.body.SetTransformXY((t.pos.x + pc.bounds.x) * Config.physicsScale, (t.pos.y + pc.bounds.y) * Config.physicsScale, t.rotation);
            pc.body.m_userData = pc;
        }
        let fd = new b2FixtureDef();
        fd.shape = shape;
        fd.density = 1.0;
        fd.friction = 5;
        let fixture = pc.body.CreateFixture(fd);
        let tPos = this.scalePoint(t.pos);
        return fixture;
    }

    getPoints(unscaled: XY[]): Point[] {
        let p: Point[] = [];
        for (let xy of unscaled) {
            p.push(new Point(xy.x, xy.y));
        }
        return p;
    }

    private addBoxInternal(r: PIXI.Rectangle, type: b2BodyType, pc: PhysicsComponent, t: Transform): b2Fixture {
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
        return this.addPolygonInternal(verts, type, pc, t);
    }

    public addShape(e: Entity, shape: XY[], bodyType?: b2BodyType) {
        if (!bodyType) {
            bodyType = b2BodyType.b2_dynamicBody;
        }
        let pc = e.getOrAdd(PhysicsComponent);
        let t = e.get(Transform);
        this.addPolygonInternal(shape, bodyType, pc, t);
    }

    createStatic(r: PIXI.Rectangle, bodyType?: b2BodyType): Entity {
        if (bodyType === undefined) {
            bodyType = b2BodyType.b2_staticBody;
        }
        let e = this.engine.entityManager.createEntity("static");
        let pc = e.add(PhysicsComponent);
        let t = e.add(Transform);
        t.pos = new Point(r.x, r.y);
        let rr = new PIXI.Rectangle(0, 0, r.width, r.height);
        this.addBoxInternal(rr, bodyType, pc, t);
        return e;
    }

    addBox(e: Entity, rect: PIXI.Rectangle, bodyType?: b2BodyType) {
        if (bodyType === undefined) {
            bodyType = b2BodyType.b2_dynamicBody;
        }
        let pc = e.getOrAdd(PhysicsComponent);
        let t = e.get(Transform);
        this.addBoxInternal(rect, bodyType, pc, t);
    }
    
    addCircle(e: Entity, radius: number, bodyType?: b2BodyType): PhysicsComponent {
        if (bodyType === undefined) {
            bodyType = b2BodyType.b2_dynamicBody;
        }
        let physicsRadius = this.scaleDistance(radius);
        let pc = e.getOrAdd(PhysicsComponent);
        let t = e.get(Transform);
        let circle = new b2CircleShape(physicsRadius);
        pc.bounds = new Rectangle(-physicsRadius, physicsRadius, 2*physicsRadius, 2*physicsRadius);
        let shapeVerts:XY[] = [
            {x: 0, y: 0},
            {x: radius, y: 0},
            {x: radius, y: radius},
            {x: 0, y: radius},
        ];
        pc.shape = this.getPoints(shapeVerts);
        this.addShapeInternal(circle, bodyType, pc, t);
        return pc;
    }

    addSensor(e: Entity, r: Rectangle, onContact: (entity: Entity) => void): b2Fixture {
        let pc = e.getOrAdd(PhysicsComponent);
        let t = e.get(Transform);
        let fixture = this.addBoxInternal(r, b2BodyType.b2_kinematicBody, pc, t);
        fixture.m_isSensor = true;
        fixture.m_density = 0;
        let fo = new FixtureObserver();
        fo.fn = (fa: b2Fixture, a: Entity, fb: b2Fixture, b: Entity) => {
            onContact(b);
        };
        fixture.m_userData = fo;
        return fixture;
    }

    onFixtureContact(fa: b2Fixture, a: Entity, fb: b2Fixture, b: Entity) {
        
    }

    attach(a: Entity, b: Entity): b2Joint {
        let jointDef = new b2WeldJointDef();
        let bodyA = a.get(PhysicsComponent).body;
        let bodyB = b.get(PhysicsComponent).body;
        let scaledAnchor = this.scalePoint(a.get(Transform).pos);
        jointDef.Initialize(bodyA, bodyB, new b2Vec2(scaledAnchor.x, scaledAnchor.y));
        return this.world.CreateJoint(jointDef);
    }

    detach(joint: b2Joint) {
        this.world.DestroyJoint(joint);
    }
    
    toggleDebug() {
        this.setDebug(!this.debug);
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
        this.debug = debug;
    }
}