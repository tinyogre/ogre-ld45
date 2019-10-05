export class Level {
    map: string[];
    messages: { [code: string]: string };
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
            "2": "Look!  Below!  It's my engine!",
            "T": "I got my main engine back!\nMaybe now I can reach that wormhole?",
        },
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
            "1": "Again? Really?",
            "S": "I got my cockpit back this time, now I can turn..."
        }
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
        }
    };
}