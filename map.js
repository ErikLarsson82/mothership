define('map', [], function() {
    var WALL = "Wall";
    var PLAY = "Player";
    var PLY1 = "Player1";
    var PLY2 = "Player2";
    var PLY3 = "Player3";
    var DEBR = "Debree";
    var MOTH = "Mothership";
    var SPAW = "Spawn";
    var SPW1 = "Spawn1";
    var SPW2 = "Spawn2";
    var SPW3 = "Spawn3";
    var PART = "Part";
    var ENEM = "Enemy";
    var FLYE = "Flyer";
    var GRUN = "Grunt";
    var SHIE = "Shieldman";
    var MINE = "Mine";
    var PUNC = "Punch";

    var types = { 
        WALL: WALL,
        PLAYER: PLAY,
        PLAYER1: PLY1,
        PLAYER2: PLY2,
        PLAYER3: PLY3,
        DEBREE: DEBR,
        MOTHERSHIP: MOTH,
        SPAWN: SPAW,
        SPAWN1: SPW1,
        SPAWN2: SPW2,
        SPAWN3: SPW3,
        PART: PART,
        FLYER: FLYE,
        GRUNT: GRUN,
        SHIELDMAN: SHIE,
        MINE: MINE,
        PUNCH: PUNC
    };
    return {
        types: types,
        map: [
            [WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL],
            [WALL,/**/,PART,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,PART,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,DEBR,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,SPW3,WALL],
            [WALL,/**/,/**/,/**/,/**/,DEBR,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,WALL,WALL,WALL,WALL,WALL,WALL,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,PLY2,/**/,/**/,PLY1,/**/,/**/,PLY3,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,SPW1,/**/,/**/,/**/,MINE,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,MOTH,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,WALL,WALL,WALL,WALL,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,DEBR,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,DEBR,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,DEBR,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,/**/,DEBR,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,DEBR,/**/,WALL],
            [WALL,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,PART,/**/,/**/,/**/,/**/,/**/,SPW2,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,/**/,WALL],
            [WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL,WALL],
        ],
        waves: [
            /*{ spawnIdx: 0, type: types.GRUNT },
            { duration: 2 },
            { spawnIdx: 0, type: types.FLYER },
            { duration: 1 },
            { spawnIdx: 2, type: types.FLYER },
            { duration: 10 },
            { spawnIdx: 1, type: types.GRUNT },
            { spawnIdx: 2, type: types.GRUNT },*/
            { duration: 5 },
            { spawnIdx: 0, type: types.FLYER },
            { spawnIdx: 1, type: types.FLYER },
            { spawnIdx: 2, type: types.FLYER },
            { duration: 2 },
            { spawnIdx: 0, type: types.FLYER },
            { spawnIdx: 1, type: types.FLYER },
            { spawnIdx: 2, type: types.FLYER },
            { duration: 2 },
            { spawnIdx: 0, type: types.GRUNT },
            { spawnIdx: 1, type: types.GRUNT },
            { spawnIdx: 2, type: types.GRUNT },
        ]
    }
    
});