import { System } from "../engine/System";
import { TtlComponent } from "./TtlComponent";
import { Entity } from "../engine/entity";
import { GameEvent } from "./GameEvent";

export class TtlSystem extends System {
    static sname = "ttl";
    startGame() {
        this.engine.events.addListener(GameEvent.END_LEVEL, this.onEndLevel.bind(this));
    }
    update(deltaTime: number): void {
        let ttls = this.engine.entityManager.getAll(TtlComponent);
        for (let e of ttls) {
            let ttl = e.get(TtlComponent);
            ttl.ttl -= deltaTime;
            if (ttl.ttl <= 0) {
                this.engine.entityManager.deleteEntity(e);
            }
        }
    }
    
    setTtl(e: Entity, duration: number) {
        let ttl = e.getOrAdd(TtlComponent);
        ttl.ttl = duration;
    }
    onEndLevel() {
        var ttls = this.engine.entityManager.getAll(TtlComponent);
        for (let e of ttls) {
            this.engine.entityManager.deleteNow(e);
        }
    }
}
