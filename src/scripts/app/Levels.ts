import {GameEvent} from "./GameEvent";
import { Engine } from "../engine/Engine";
import { LevelSystem } from "./LevelSystem";

export class Level {
    map: string[];
    messages: { [code: string]: string };
    events: [ string, (engine: Engine) => void ][];
}


export class Levels {
    static level1: Level = {
        map: [
            "WWWWWWWWWWWWWWWWWWWWWW",
            "W....................W",
            "W....................W",
            "W.........O..........W",
            "W....................W",
            "W....................W",
            "W.........P..........W",
            "W.........1..........W",
            "W....................W",
            "W....................W",
            "W....................W",
            "W....................W",
            "W....................W",
            "W....................W",
            "W....................W",
            "W....................W",
            "W.........2..........W",
            "W....................W",
            "W....................W",
            "W.........T..........W",
            "WWWWWWWWWWWWWWWWWWWWWW",
        ],
        messages: {
            "1": "Oh no!  Where are all my ship parts?! I can't do anything...",
            "2": "Look below!  It's my engine!",
            "T": "I got my main engine back!\nMaybe now I can reach that wormhole up there?",
        },
        events: []
    };

    static level2: Level = {
        map: [
            "WWWWWWWWWWWWWWWWWWWWWWWWWWW",
            "W.........................W",
            "W.........P...............W",
            "W.........1...............W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.........S......O........W",
            "WWWWWWWWWWWWWWWWWWWWWWWWWWW",
        ],              
        messages: {     
            //"1": "The name's Nothing. Hubert Nothing.\nNice to meet you.",
            "S": "I got my controls back this time, now I can turn...",    
        },
        events: []
    };

    static level3: Level = {
        map: [
            "WWWWWWWWWWWWWWWWWWWWWWWWWWW",
            "W.........................W",
            "W.........................W",
            "W.....W..P.........W......W",
            "W.....W..G.........W......W",
            "W.....WWWWWW.......W......W",
            "W..........W.......W......W",
            "W..........W.......W......W",
            "W..........W.......W......W",
            "W..........W.......W......W",                                
            "W..........W....O..W......W",
            "W..........WWWWWWWWW......W",
            "W.........................W",                                                  
            "W.........................W",
            "W.........................W",
            "WWWWWWWWWWWWWWWWWWWWWWWWWWW",
        ],              
        messages: {     
            "G": "A Turret!  Now we're talking!",
        },
        events: [
            [GameEvent.FIRED_SHOT, (engine) => LevelSystem.checkFirstShot(engine)],
        ]
    };
    static level4: Level = {
        map: [
            "WWWWWWWWWWWWWWWWWWWWWWWWWWW",
            "W.........................W",                            
            "W.........................W",
            "W.........................W",
            "W.........................W",
            "W.S.......................W",                            
            "W.P.......................W",                            
            "W.T.......................W",                            
            "W.........................W",                            
            "W.1...H...................W",                            
            "WWWWWWWWWW.----.WWWWWWWWWWW",                            
            "W........WWW..WWW.........W",                            
            "W.........................W",                            
            "W............O............W",
            "W.........................W",
            "WWWWWWWWWWWWWWWWWWWWWWWWWWW",
        ],              
        messages: {     
            "1": "I think that's a tow hook!"
        },
        events: [
        ]
    };
}