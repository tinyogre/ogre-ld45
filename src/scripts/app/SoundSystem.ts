import { System } from "../engine/System";

export class SoundSystem extends System {
    static sname = "soundsystem";
    sounds: { [key: string]: Howl } = {};

    static wormholeSounds = ["wormhole01_s", "wormhole02_s"];
    static collisionSounds = ["collision01_s", "collision02_s", "collision03_s"];
    static explosionSounds = ["explosion01_s", "explosion02_s", "explosion03_s"];

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

    playFromList(sounds: string[]) {
        let sound = SoundSystem.randomSound(sounds);
        if (sound) {
            this.play(sound);
        }
    }

    static randomSound(sounds: string[]): string {
        return sounds[Math.floor(Math.random() * sounds.length)];
    }
}