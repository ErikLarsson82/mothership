define('game', [
    'underscore',
    'userInput',
    'map'
], function (
    _,
    userInput,
    map
) {
    // 144 or 60
    const FPS = 144;

    const gameObjects = [];
    window.gameObjects = gameObjects;

    const GRID_SIZE = 20;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    class GameObject {
        constructor(pos, type) {
            this.type = type;
            this.pos = pos;
            this.markedForRemoval = false;
        }
        tick() {}
        draw() {
            context.fillStyle = "green";
            context.fillRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    class Player extends GameObject {
        constructor(pos, type, id) {
            super(pos, type);
            this.id = id;
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
        draw() {
            context.fillStyle = "red";
            context.fillRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    function collision(obj1, obj2) {
        if (obj1.type === map.types.PLAYER1 && obj2.type === map.types.PLAYER2 || obj2.type === map.types.PLAYER1 && obj1.type === map.types.PLAYER2) {
            // players are colliding'
        }
    }

    function attemptMove(gameObject, newPos) {
        var resultX = _.find(gameObjects, function(obj) {
            if (gameObject === obj) return false;
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
                        gameObjects.push(new Player({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PLAYER1, 0));
                    break;
                    case map.types.PLAYER2:
                        gameObjects.push(new Player({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PLAYER2, 1));
                    break;
                }   
            });
        });
    }

    return {
        init: function() {
            generateMap();
        },
        tick: function() {

            _.each(gameObjects, function(gameObject) {
                gameObject.tick();
            });

            context.fillStyle = "gray"
            context.fillRect(0, 0, 1024, 768)

            _.each(gameObjects, function(gameObject) {
                gameObject.draw();
            });
        }
    }
});