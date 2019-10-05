import { Component } from "../engine/component";

export class PlayerComponent extends Component {
    static cname: string = "playercomponent";
    canSteer: boolean = false;
    canThrust: boolean = false;
}