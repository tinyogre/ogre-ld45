import { Component } from "../component";

export class PickupComponent extends Component {
    static cname: string = "pickupcomponent";
    onPickup: (p: PickupComponent) => void;

}