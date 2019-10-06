import { Component } from "../engine/component";
import { ParticleEmitter } from "../engine/components/ParticleComponent";
import { Entity } from "../engine/entity";
import { b2Fixture, b2Joint } from "@flyover/box2d";

export class PlayerComponent extends Component {
    static cname: string = "playercomponent";
    canSteer: boolean = false;
    canThrust: boolean = false;
    canDebug: boolean = true;
    canTurret: boolean = false;
    turretSprite?: PIXI.Sprite;
    thrustEmitter: ParticleEmitter;
    canTowHook: boolean;
    towHookSprite: PIXI.Sprite;
    towHookDeployed: boolean;
    doAttachPhysicsObject: Entity;
    hookSensor: b2Fixture;
    activeJoint: b2Joint;
}