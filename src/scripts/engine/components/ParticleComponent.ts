import { Component } from "../component";
import { ParticleContainer, Point, Graphics, Sprite } from "pixi.js";
import { ParticleSystem } from "../systems/ParticleSystem";

export class Particle {
    pos: Point = new Point(0,0);
    velocity: Point = new Point(0,0);
    rotation: number = 0;
    g: Sprite;
    gravityCoefficient: number;
    ttl: number;
}

export class ParticleEmitterDef {
    sprite: string;
    permanent: boolean = false;
    rotation: number = 0;
    arc: number = 2 * Math.PI;
    emitterDuration?: number = 10;
    particleDuration: number = 1;
    spawnPerSecond = 1;
    velocity: number = 1;
    gravityCoefficient: number = 0.5;
}

export class ParticleEmitter {
    def: ParticleEmitterDef;
    enabled: boolean = true;
    ttl: number;
    spawnCount: number;
}

export class ParticleComponent extends Component {
    static cname = "particle";
    
    emitters: ParticleEmitter[] = [];
}
