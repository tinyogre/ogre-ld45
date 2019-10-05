import { Component } from "../component";
import { ParticleContainer, Point, Graphics, Sprite } from "pixi.js";
import { ParticleSystem } from "../systems/ParticleSystem";
import { Transform } from "./Transform";

export class Particle {
    pos: Point = new Point(0,0);
    velocity: Point = new Point(0,0);
    rotation: number = 0;
    g: Sprite;
    gravityCoefficient: number;
    ttl: number;
    attractTo: Transform;
    attractCoefficient: number;
}

export class ParticleEmitterDef {
    sprite: string;
    permanent?: boolean;
    rotation?: number;
    arc?: number;
    emitterDuration?: number = 10;
    particleDuration: number = 1;
    spawnPerSecond = 1;
    velocity: number = 1;
    gravityCoefficient: number = 0.5;
    spawnRadius?: number;
    attractCoefficient?: number;
    foreground?: boolean;
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


export class ParticleDef {
    static WORMHOLE = {
        sprite: "wormholespark",
        permanent: true,
        particleDuration: 0.3,
        spawnPerSecond: 40,
        velocity: 0,
        gravityCoefficient: 0,
        spawnRadius: 32,
        attractCoefficient: 5,
        foreground: true,
    };
}