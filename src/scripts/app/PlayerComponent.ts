import { Component } from "../engine/component";
import { ParticleEmitter } from "../engine/components/ParticleComponent";

export class PlayerComponent extends Component {
    static cname: string = "playercomponent";
    canSteer: boolean = false;
    canThrust: boolean = false;
    thrustEmitter: ParticleEmitter;
}