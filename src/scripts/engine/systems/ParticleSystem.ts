import { System } from "../System";
import { ParticleComponent, Particle, ParticleEmitter, ParticleEmitterDef } from "../components/ParticleComponent";
import { Config } from "../../app/config";
import { Entity } from "../entity";
import { Point } from "pixi.js";
import { Transform } from "../components/Transform";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { MathUtil } from "../MathUtil";
import { XY } from "@flyover/box2d";

export class ParticleSystem extends System {
    static sname = "particle";
    particles: Particle[] = [];
    background: PIXI.ParticleContainer;
    foreground: PIXI.ParticleContainer;

    startGame() {
        this.background = new PIXI.ParticleContainer();
        this.background.zIndex = -500;
        this.engine.gameStage.addChild(this.background);

        this.foreground = new PIXI.ParticleContainer();
        this.foreground.zIndex = 500;
        this.engine.gameStage.addChild(this.foreground);
    }

    update(deltaTime: number): void {
        let controllers = this.engine.entityManager.getAll(ParticleComponent);
        for (let c of controllers) {
            this.updateEmitters(deltaTime, c.get(ParticleComponent));
        }
        this.updateParticles(deltaTime, this.particles);
    }

    updateEmitters(deltaTime: number, p: ParticleComponent) {
        for (let i = p.emitters.length - 1; i >= 0; i--) {
            let e = p.emitters[i];
            if (!e.enabled) {
                continue;
            }
            if (!e.def.permanent) {
                e.ttl -= deltaTime;
                if (e.ttl <= 0) {
                    delete p.emitters[i];
                    p.emitters.splice(i, 1);
                    continue;
                }
            }

            e.spawnCount += e.def.spawnPerSecond * deltaTime;
            while(e.spawnCount > 1) {
                this.addParticle(e, p);
                e.spawnCount -= 1;
            }
        }
    }

    updateParticles(deltaTime: number, particles: Particle[]) {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.ttl -= deltaTime;
            if (p.ttl <= 0) {
                particles[i].g.parent.removeChild(particles[i].g);
                delete particles[i];
                particles.splice(i, 1);
                continue;
            }
            p.velocity.y += Config.gravity * deltaTime * p.gravityCoefficient;

            if (p.attractTo) {
                let dir: Point = new Point(p.attractTo.pos.x - p.pos.x, p.attractTo.pos.y - p.pos.y);
                dir = MathUtil.normalize(dir);
                p.velocity.x += dir.x * p.attractCoefficient;
                p.velocity.y += dir.y * p.attractCoefficient;
            }

            p.pos.x += p.velocity.x * deltaTime;
            p.pos.y += p.velocity.y * deltaTime;
            p.g.position = p.pos;
        }
    }

    public addParticleEmitter(e: Entity, def: ParticleEmitterDef): ParticleEmitter {
        let p = e.getOrAdd(ParticleComponent);
        let emitter = new ParticleEmitter();
        emitter.def = def;
        emitter.ttl = def.emitterDuration ? def.emitterDuration : 0;
        emitter.spawnCount = 0;
        p.emitters.push(emitter);
        return emitter;
    }

    addParticle(e: ParticleEmitter, comp: ParticleComponent) {
        let t = comp.entity.get(Transform);
        let physicsVelocity: XY;
        let physics = comp.entity.get(PhysicsComponent);
        if (physics) {
            physicsVelocity = physics.body.GetLinearVelocity();
        } else {
            physicsVelocity = {x: 0, y: 0};
        }
        
        let direction = Math.random() * (e.def.arc || 2 * Math.PI) + (e.def.rotation || 0) + t.rotation;
        let particle = new Particle();
        particle.velocity.x = Math.cos(direction) * e.def.velocity + physicsVelocity.x / Config.physicsScale;
        particle.velocity.y = Math.sin(direction) * e.def.velocity + physicsVelocity.y / Config.physicsScale;
        particle.g = PIXI.Sprite.from(e.def.sprite);
        particle.gravityCoefficient = e.def.gravityCoefficient || 0;
        particle.attractCoefficient = e.def.attractCoefficient || 0;
        
        particle.pos = new Point(t.pos.x, t.pos.y);
        if (e.def.spawnRadius) {
            let fromCenter = Math.random() * 2 * Math.PI;
            particle.pos.x += Math.cos(fromCenter) * Math.random() * e.def.spawnRadius;
            particle.pos.y += Math.sin(fromCenter) * Math.random() * e.def.spawnRadius;
        }

        particle.ttl = e.def.particleDuration;
        if (e.def.attractCoefficient) {
            particle.attractTo = t;
            particle.attractCoefficient = e.def.attractCoefficient;
        }
        particle.g.rotation = Math.random() * 2 * Math.PI;
        this.particles.push(particle);
        if (e.def.foreground) {
            this.foreground.addChild(particle.g);
        } else {
            this.background.addChild(particle.g);
        }
    }
}