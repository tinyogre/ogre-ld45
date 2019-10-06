import { Component } from "../component";

export class PickupComponent extends Component {
    static cname: string = "pickupcomponent";
    what: string;
    onPickup: (p: PickupComponent) => void;
    message?: string;
    sound: string;
}