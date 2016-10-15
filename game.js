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
    const FPS = 144;

    let gameObjects = [];
    let spawnObjects = [];
    let waveController = null;
    window.gameObjects = gameObjects;

    const GRID_SIZE = 20;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
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
            this.debree = 0;
        }
        tick() {
            var pad = userInput.readInput()[this.id];
            if (!(pad && pad.axes && pad.axes[2] && pad.axes[3])) return;

            var newPos = {
                x: this.pos.x + pad.axes[0],    
                y: this.pos.y + pad.axes[1],    
            }
            attemptMove(this, newPos);
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
                    }
                }
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
    window.findGameObj = findGameObj;
    window.findGameObjWithIndex = findGameObjWithIndex;

    function typeCheck(obj1, obj2, type1, type2) {
        return (obj1.type === type1 && obj2.type === type2 || obj2.type === type1 && obj1.type === type2)
    }

    function collision(obj1, obj2) {

        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.FLYER)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var flyer = (obj1.type === map.types.FLYER) ? obj1 : obj2;
            if (player.id === 0) {
                flyer.markedForRemoval = true;
            } else {
                player.disabled = true;
            }
        }
        if (typeCheck(obj1, obj2, map.types.FLYER, map.types.MOTHERSHIP)) {
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.01;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.DEBREE)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var debree = (obj1.type === map.types.DEBREE) ? obj1 : obj2;
            player.debree = player.debree + 1;
            debree.markedForRemoval = true;
        }
    }

    function attemptMove(gameObject, newPos) {
        var resultX = _.find(gameObjects, function(obj) {
            if (gameObject === obj) return false;
            if (!obj.pos) debugger;
            var legal = (
                (newPos.x > obj.pos.x + GRID_SIZE) || (newPos.x + GRID_SIZE < obj.pos.x) ||
                (gameObject.pos.y > obj.pos.y + GRID_SIZE) || (gameObject.pos.y + GRID_SIZE < obj.pos.y)
            );
            if (!legal) collision(gameObject, obj);
            return !legal;
        });
        var resultY = _.find(gameObjects, function(obj) {
            if (gameObject === obj) return false;
            var legal = (
                (gameObject.pos.x > obj.pos.x + GRID_SIZE) || (gameObject.pos.x + GRID_SIZE < obj.pos.x) ||
                (newPos.y > obj.pos.y + GRID_SIZE) || (newPos.y + GRID_SIZE < obj.pos.y)
            );
            if (!legal) collision(gameObject, obj);
            return !legal;
        });
        (resultX) ? null : gameObject.pos.x = newPos.x;
        (resultY) ? null : gameObject.pos.y = newPos.y;
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
                }   
            });
        });
    }

    function endConditions() {
        //waveController is done and no more enemies -> Map complete! -> 1
        //all players on the ground -> Game over -> 2
        //mothership destroyed -> Game over -> 2
        //else -> false
        if (waveController.waves.length === 0 && false) {
            return 1;
        }
        if (findGameObj(map.types.MOTHERSHIP).hp <= 0) {
            return 2;
        }
        return false;
    }

    return {
        init: function() {
            generateMap();
            waveController = new WaveController(map.waves);

            context.font="20px Verdana";
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

            _.each(gameObjects, function(gameObject) {
                gameObject.draw();
            });

            //GUI
            context.fillStyle = "white"
            var mothership = findGameObj(map.types.MOTHERSHIP);
            context.fillText('Mothership HP: ' + mothership.hp.toFixed(0),400,16);
        }
    }
});