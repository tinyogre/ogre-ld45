import { System } from "../engine/System";
import { Point, Container } from "pixi.js";
import { GameEvent } from "./GameEvent";

class MessageDisplay {
    ttl: number;
    text: PIXI.Text;
}

export class MessageSystem extends System {
    static sname = "messagesystem";

    messages: MessageDisplay[] = [];
    startGame() {
        this.engine.events.addListener(GameEvent.END_LEVEL, this.endLevel.bind(this));
    }

    endLevel() {
        for (let m of this.messages) {
            m.ttl = 0;
        }
    }
    
    update(deltaTime: number): void {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            let m = this.messages[i];
            m.ttl -= deltaTime;
            if (m.ttl <= 0) {
                m.text.parent.removeChild(m.text);
                delete this.messages[i];
                this.messages.splice(i, 1);
            }
        }
    }
    
    addMessage(p: Point, stage: Container, text: string, ttl: number, color: number): MessageDisplay {
        let display = new MessageDisplay();
        display.text = new PIXI.Text(text, { fontFamily: 'Press Start 2P', fontSize: 8, fill: color, align: 'center' });
        let width = display.text.width;
        display.text.position = new Point(
            p.x - width / 2,
            p.y - display.text.height);
        stage.addChild(display.text)
        display.ttl = ttl;
        this.messages.push(display);
        return display;
    }
}