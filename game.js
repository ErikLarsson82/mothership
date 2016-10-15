define('game', [
    'underscore',
    'userInput',
    'map'
], function (
    _,
    userInput,
    map
) {
    //Refactor:
    // - Red ut "types" och index. Player med index 1,2,3 osv. Waves ska kunna peka ut SPAWN1 och inte bara ett index
    // - Classer behöver TYPES som input, helt redundant

    // 144 or 60
    var DEBUG_WRITE_BUTTONS = false;
    var FULLSCREEN = false;

    const FPS = 144;

    let gameObjects = [];
    let spawnObjects = [];
    let waveController = null;
    let screenShaker = null;
    window.gameObjects = gameObjects;

    const GRID_SIZE = 20;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    function debugWriteButtons(pad) {
        if (!DEBUG_WRITE_BUTTONS) return;
        _.each(pad && pad.buttons, function(button, idx) {
            if (button.pressed) console.log(idx + " pressed");
        })
    }
    
    class GameObject {
        constructor(pos, type) {
            this.type = type;
            this.pos = pos;
            this.markedForRemoval = false;
            this.color = "black";
        }
        remove () {
            return this.markedForRemoval;
        }
        tick() {}
        draw() {
            context.fillStyle = this.color;
            context.fillRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    class Debree extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "blue";
        }
    }

    class Flyer extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "gray";
        }
        tick() {
            var motherPos = findGameObj(map.types.MOTHERSHIP).pos;
            var x = (motherPos.x > this.pos.x) ? this.pos.x + 0.1 : this.pos.x - 0.1;
            var y = (motherPos.y > this.pos.y) ? this.pos.y + 0.1 : this.pos.y - 0.1;
            var newPos = {
                x: x,
                y: y
            }
            attemptMove(this, newPos);   
        }
    }

    class Grunt extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#2f2f2f";
        }
        tick() {
            var motherPos = findGameObj(map.types.MOTHERSHIP).pos;
            var x = (motherPos.x > this.pos.x) ? this.pos.x + 0.1 : this.pos.x - 0.1;
            var y = (motherPos.y > this.pos.y) ? this.pos.y + 0.1 : this.pos.y - 0.1;
            var newPos = {
                x: x,
                y: y
            }
            attemptMove(this, newPos);   
        }
    }

    class Spawn extends GameObject {
        constructor(pos, type, id) {
            super(pos, type);
            this.id = id;
            this.color = "red";
        }
    }

    class Part extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "orange";
        }
    }

    class Punch extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#9c953e";
            this.duration = 10;
        }
        tick() {
            this.duration--;
            if (this.duration <= 0) {
                this.markedForRemoval = true;
            }
        }
    }

    class Mine extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#8df9ff";
        }
    }

    class Mothership extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "green";
            this.hp = 100;
        }
    }

    class Player extends GameObject {
        constructor(pos, type, id) {
            super(pos, type);
            this.id = id;
            this.color = "purple";
            this.debree = 1;
            this.disabled = false;
            this.cooldown = 0;
        }
        tick() {
            if (this.disabled) return;
            this.cooldown--;
            var pad = userInput.readInput()[this.id];
            debugWriteButtons(pad);
            if (!(pad && pad.axes && pad.axes[2] && pad.axes[3])) return;

            this.checkPunch(pad);
            this.checkPlaceMine(pad);

            var newPos = {
                x: this.pos.x + pad.axes[0],    
                y: this.pos.y + pad.axes[1],    
            }
            attemptMove(this, newPos);
        }
        checkPlaceMine(pad) {
            if (pad.buttons[4].pressed && this.cooldown <= 0 && this.debree > 0) {
                var modifier = { x: 0, y: 0 };
                if (pad.axes[2] < -0.8) {
                    modifier = {
                        x: -GRID_SIZE*2,
                        y: 0
                    }
                } else if (pad.axes[2] > 0.8) {
                    modifier = {
                        x: +GRID_SIZE*2,
                        y: 0
                    }
                }
                if (pad.axes[3] < -0.8) {
                    modifier = {
                        x: 0,
                        y: -GRID_SIZE*2
                    }
                } else if (pad.axes[3] > 0.8) {
                    modifier = {
                        x: 0,
                        y: +GRID_SIZE*2
                    }
                }
                if (modifier.x === 0 && modifier.y === 0) return;

                this.cooldown = 70;

                var placementPos = _.clone(this.pos);
                placementPos.x = placementPos.x + modifier.x;
                placementPos.y = placementPos.y + modifier.y;
                gameObjects.push(new Mine(placementPos, map.types.MINE));

                this.debree = this.debree - 1;
            }
        }
        checkPunch(pad) {
            if (pad.buttons[5].pressed && this.cooldown <= 0) {
                var modifier1 = { x: 0, y: 0 };
                var modifier2 = { x: 0, y: 0 };
                if (pad.axes[2] < -0.8) {
                    modifier1 = {
                        x: -GRID_SIZE,
                        y: 0
                    }
                    modifier2 = {
                        x: -GRID_SIZE*2,
                        y: 0
                    }
                } else if (pad.axes[2] > 0.8) {
                    modifier1 = {
                        x: +GRID_SIZE,
                        y: 0
                    }
                    modifier2 = {
                        x: +GRID_SIZE*2,
                        y: 0
                    }
                }
                if (pad.axes[3] < -0.8) {
                    modifier1 = {
                        x: 0,
                        y: -GRID_SIZE
                    }
                    modifier2 = {
                        x: 0,
                        y: -GRID_SIZE*2
                    }
                } else if (pad.axes[3] > 0.8) {
                    modifier1 = {
                        x: 0,
                        y: +GRID_SIZE
                    }
                    modifier2 = {
                        x: 0,
                        y: +GRID_SIZE*2
                    }
                }
                if (modifier1.x === 0 && modifier1.y === 0 && modifier2.x === 0 && modifier2.y === 0) return;

                this.cooldown = 70;

                var firstPos = _.clone(this.pos);
                firstPos.x = firstPos.x + modifier1.x;
                firstPos.y = firstPos.y + modifier1.y;
                gameObjects.push(new Punch(firstPos, map.types.PUNCH));
                var secondPos = _.clone(this.pos);
                secondPos.x = secondPos.x + modifier2.x;
                secondPos.y = secondPos.y + modifier2.y;
                gameObjects.push(new Punch(secondPos, map.types.PUNCH));
            }
        }
        draw() {
            context.fillStyle = this.color;
            if (this.disabled) {
                context.beginPath();
                context.lineWidth = "2";
                context.strokeStyle = this.color;
                context.rect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
                context.stroke();
            } else {
                super.draw();
                context.fillStyle = "white";
                context.fillText(this.debree, this.pos.x + 3, this.pos.y + 18)
            }
        }
    }

    class WaveController {
        constructor(waves) {
            this.waves = waves || [];
            this.currentWave = null;
        }
        tick() {
            if (this.currentWave) {
                this.currentWave.counter++;
                if (this.currentWave.counter >= this.currentWave.duration) this.currentWave = null;
            } else {
                var blueprint = this.waves.shift() || {};
                if (blueprint.duration) {
                    this.currentWave = {
                        duration: blueprint.duration * FPS,
                        counter: 0
                    }
                } else if (blueprint.type) {
                    switch(blueprint.type) {
                        case map.types.FLYER:
                            var targetPos = _.clone(findGameObjWithIndex(map.types.SPAWN, blueprint.spawnIdx).pos);
                            var motherPos = findGameObj(map.types.MOTHERSHIP).pos;
                            targetPos.x = (motherPos.x > targetPos.x) ? targetPos.x + GRID_SIZE : targetPos.x - GRID_SIZE;
                            targetPos.y = (motherPos.y > targetPos.y) ? targetPos.y + GRID_SIZE : targetPos.y - GRID_SIZE;
                            gameObjects.push(new Flyer(targetPos, map.types.FLYER));
                        break;
                        case map.types.GRUNT:
                            var targetPos = _.clone(findGameObjWithIndex(map.types.SPAWN, blueprint.spawnIdx).pos);
                            var motherPos = findGameObj(map.types.MOTHERSHIP).pos;
                            targetPos.x = (motherPos.x > targetPos.x) ? targetPos.x + GRID_SIZE : targetPos.x - GRID_SIZE;
                            targetPos.y = (motherPos.y > targetPos.y) ? targetPos.y + GRID_SIZE : targetPos.y - GRID_SIZE;
                            gameObjects.push(new Grunt(targetPos, map.types.GRUNT));
                        break;
                    }
                }
            }
        }
    }

    class ScreenShaker {
        constructor() {
            this.idx = 0;
            var shakeAmount = 7;
            var shakeAmount2 = 4;
            this.shakeArray = [
                [0,0],
                [shakeAmount,0],
                [shakeAmount,shakeAmount2],
                [shakeAmount,shakeAmount2],
                [shakeAmount,shakeAmount2],
                [shakeAmount,shakeAmount2],
                [shakeAmount,0],
                [0,-shakeAmount2],
                [0,-shakeAmount2],
                [0,-shakeAmount2],
                [0,-shakeAmount2],
                [0,-shakeAmount2],
                [0,-shakeAmount2],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [-shakeAmount,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,shakeAmount2],
                [0,shakeAmount2],
                [0,shakeAmount2],
                [shakeAmount,shakeAmount2],
                [shakeAmount,shakeAmount2],
                [shakeAmount,shakeAmount2],
                [shakeAmount,0],
                [shakeAmount,0],
                [shakeAmount,0],
                [shakeAmount,0],
                [0,0],
            ];
            window.addEventListener("keydown", function(e) {
                if (e.keyCode === 67) {
                    this.shake();
                }
            }.bind(this))
        }
        shake() {
            if (this.idx === 0) {
                this.idx = this.shakeArray.length-1;
            }
        }
        render() {
            if (this.idx > 0) {
                this.idx = this.idx - 1;
                context.save();
                context.translate(this.shakeArray[this.idx][0], this.shakeArray[this.idx][1]);
            }
        }
        restore() {
            if (this.idx > 0) {
                context.restore();
            }
        }
    }

    function findGameObj(type) {
        return _.find(gameObjects, function(item) {
            return item.type === type;
        });
    }
    function findGameObjWithIndex(type, idx) {
        return _.find(gameObjects, function(item) {
            return item.type === type && item.id === idx;
        })
    }
    
    function typeCheck(obj1, obj2, type1, type2) {
        return (obj1.type === type1 && obj2.type === type2 || obj2.type === type1 && obj1.type === type2)
    }

    function collisionFilterIgnored(obj1, obj2) {
        //Every pair here ignores collisions
        var table = [
            [map.types.FLYER, map.types.MINE]
        ]
        return !!_.find(table, function(filter) {
            return obj1 === filter[0] && obj2 === filter[1] || obj2 === filter[0] && obj1 === filter[1];
        });
    }
    
    function collision(obj1, obj2) {

        if (obj1.type === map.types.PLAYER && obj2.type === map.types.PLAYER) {
            obj1.disabled = false;
            obj2.disabled = false;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.FLYER)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.MINE)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var mine = (obj1.type === map.types.MINE) ? obj1 : obj2;
            player.disabled = true;
            mine.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.GRUNT)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, map.types.PUNCH, map.types.FLYER)) {
            var flyer = (obj1.type === map.types.FLYER) ? obj1 : obj2;
            flyer.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.FLYER, map.types.MOTHERSHIP)) {
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.01;
            screenShaker.shake();
        }
        if (typeCheck(obj1, obj2, map.types.GRUNT, map.types.MINE)) {
            var mine = (obj1.type === map.types.MINE) ? obj1 : obj2;
            var grunt = (obj1.type === map.types.GRUNT) ? obj1 : obj2;
            mine.markedForRemoval = true;
            grunt.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.GRUNT, map.types.MOTHERSHIP)) {
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.03;
            screenShaker.shake();
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.DEBREE)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var debree = (obj1.type === map.types.DEBREE) ? obj1 : obj2;
            player.debree = player.debree + 1;
            debree.markedForRemoval = true;
        }
    }

    function attemptMove(gameObject, newPos) {
        var somethingBlockedX = _.find(gameObjects, function(obj) {
            if (gameObject === obj) return false;
            if (!obj.pos) debugger;
            var legal = (
                (newPos.x > obj.pos.x + GRID_SIZE) || (newPos.x + GRID_SIZE < obj.pos.x) ||
                (gameObject.pos.y > obj.pos.y + GRID_SIZE) || (gameObject.pos.y + GRID_SIZE < obj.pos.y)
            );
            if (!legal) collision(gameObject, obj);
            return !legal && !collisionFilterIgnored(gameObject.type, obj.type);
        });
        var somethingBlockedY = _.find(gameObjects, function(obj) {
            if (gameObject === obj) return false;
            var legal = (
                (gameObject.pos.x > obj.pos.x + GRID_SIZE) || (gameObject.pos.x + GRID_SIZE < obj.pos.x) ||
                (newPos.y > obj.pos.y + GRID_SIZE) || (newPos.y + GRID_SIZE < obj.pos.y)
            );
            if (!legal) collision(gameObject, obj);
            return !legal && !collisionFilterIgnored(gameObject.type, obj.type);
        });
        (somethingBlockedX) ? null : gameObject.pos.x = newPos.x;
        (somethingBlockedY) ? null : gameObject.pos.y = newPos.y;
    }

    function generateMap() {
        _.each(map.map, function(row, rowIdx) {
            _.each(row, function(item, colIdx) {
                switch(item) {
                    case map.types.WALL:
                        gameObjects.push(new GameObject({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.WALL));
                    break;
                    case map.types.PLAYER1:
                        gameObjects.push(new Player({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PLAYER, 0));
                    break;
                    case map.types.PLAYER2:
                        gameObjects.push(new Player({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PLAYER, 1));
                    break;
                    case map.types.PLAYER3:
                        gameObjects.push(new Player({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PLAYER, 2));
                    break;
                    case map.types.DEBREE:
                        gameObjects.push(new Debree({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.DEBREE));
                    break;
                    case map.types.MOTHERSHIP:
                        gameObjects.push(new Mothership({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.MOTHERSHIP));
                    break;
                    case map.types.SPAWN1:
                        gameObjects.push(new Spawn({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.SPAWN, 0));
                    break;
                    case map.types.SPAWN2:
                        gameObjects.push(new Spawn({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.SPAWN, 1));
                    break;
                    case map.types.SPAWN3:
                        gameObjects.push(new Spawn({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.SPAWN, 2));
                    break;
                    case map.types.PART:
                        gameObjects.push(new Part({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PART));
                    break;
                    case map.types.MINE:
                        gameObjects.push(new Mine({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.MINE));
                    break;
                }   
            });
        });
    }

    function allEnemiesOnMap() {
        return _.filter(gameObjects, function(item) {
            return item.type === map.types.FLYER || item.type === map.types.GRUNT;
        });
    }

    function endConditions() {
        if (waveController.waves.length === 0 && allEnemiesOnMap().length === 0) {
            return 1;
        }
        if (findGameObj(map.types.MOTHERSHIP).hp <= 0) {
            return 2;
        }
        if (
            findGameObjWithIndex(map.types.PLAYER, 0).disabled &&
            findGameObjWithIndex(map.types.PLAYER, 1).disabled &&
            findGameObjWithIndex(map.types.PLAYER, 2).disabled
        ) {
            return 2;
        }
        return false;
    }

    return {
        init: function() {
            generateMap();
            waveController = new WaveController(map.waves);
            screenShaker = new ScreenShaker();

            context.font="20px Verdana";

            findGameObjWithIndex(map.types.PLAYER, 1).disabled = true;
            findGameObjWithIndex(map.types.PLAYER, 2).disabled = true;

            if (FULLSCREEN) {
                canvas.style.height = "100%";
                canvas.style.width = "100%";
            }
        },
        tick: function() {

            var end = endConditions();
            if (end) {
                if (end === 1) {
                    context.fillStyle = "green"
                    context.fillRect(100, 100, 400, 100);
                    context.fillStyle = "black"
                    context.fillText('Map finished!',130,130);
                    return;
                } else if (end === 2) {
                    context.fillStyle = "red"
                    context.fillRect(100, 100, 400, 100);
                    context.fillStyle = "black"
                    context.fillText('GAME OVER',130,130);
                    return;
                }
            }

            waveController.tick();

            _.each(gameObjects, function(gameObject) {
                gameObject.tick();
            });

            gameObjects = _.filter(gameObjects, function(gameObject) {
                return !gameObject.remove();
            });

            _.each(spawnObjects, function(spawnFunction) {
                gameObjects.push(spawnFunction());
            });
            spawnObjects.length = 0;

            context.fillStyle = "#d0d0d0"
            context.fillRect(0, 0, 1024, 768)

            screenShaker.render();

            _.each(gameObjects, function(gameObject) {
                gameObject.draw();
            });

            //GUI
            context.fillStyle = "white"
            var mothership = findGameObj(map.types.MOTHERSHIP);
            context.fillText('Mothership HP: ' + mothership.hp.toFixed(0),400,16);

            screenShaker.restore();
        }
    }
});