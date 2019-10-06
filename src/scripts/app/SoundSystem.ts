import { System } from "../engine/System";

export class SoundSystem extends System {
    static sname = "soundsystem";
    sounds: { [key: string]: Howl } = {};

    update(deltaTime: number): void {
    }

    add(key: string, sound: Howl) {
        this.sounds[key] = sound;
    }

    play(key: string) {
        let sound = this.sounds[key];
        if (sound) {
            sound.play();
        }
    }
}