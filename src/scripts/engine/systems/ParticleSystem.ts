import { System } from "../System";
import { ParticleComponent, Particle, ParticleEmitter, ParticleEmitterDef } from "../components/ParticleComponent";
import { Config } from "../../app/config";
import { Entity } from "../entity";
import { Point } from "pixi.js";
import { Transform } from "../components/Transform";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class ParticleSystem extends System {
    static sname = "particle";
    particles: Particle[] = [];
    g: PIXI.ParticleContainer;

    startGame() {
        this.g = new PIXI.ParticleContainer();
        this.g.zIndex = -500;
        this.engine.app.stage.addChild(this.g);
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
            p.velocity.y += Config.gravity * deltaTime;
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
        let physics = comp.entity.get(PhysicsComponent);
        let physicsVelocity = physics.body.GetLinearVelocity();
        let direction = Math.random() * e.def.arc + e.def.rotation + t.rotation;
        let particle = new Particle();
        particle.velocity.x = Math.cos(direction) * e.def.velocity + physicsVelocity.x / Config.physicsScale;
        particle.velocity.y = Math.sin(direction) * e.def.velocity + physicsVelocity.y / Config.physicsScale;
        particle.g = PIXI.Sprite.from(e.def.sprite);
        particle.pos = new Point(t.pos.x, t.pos.y);
        particle.ttl = e.def.particleDuration;
        this.particles.push(particle);
        this.g.addChild(particle.g);
    }
}