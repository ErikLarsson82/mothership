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
    var DEBUG_DRAW_WAYPOINTS = false;
    var FULLSCREEN = false;

    const FPS = 144;
    const WAYPOINT_REGEX = /W[0-9](G|F)[0-9]/g;

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
            this.isPhysical = true;
        }
        remove () {
            return this.markedForRemoval;
        }
        tick() {}
        draw() {
            // TODO: move drawing to each class instead
            if (!DEBUG_DRAW_WAYPOINTS && this.type.match(WAYPOINT_REGEX)) {
                return
            }
            context.fillStyle = this.color;
            context.fillRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    class Waypoint extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#FFAAAA";
            this.isPhysical = false;
        }
        tick() {}
        draw() {
            super.draw();
            if (DEBUG_DRAW_WAYPOINTS) {
                context.fillStyle = this.color;
                context.fillRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
            }
        }
    }

    class Debree extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#80d0ff";
            this.deconstructTime = 0;
        }
        deconstruct() {
            this.deconstructTime = this.deconstructTime + 0.01;
        }
        draw() {
            context.fillStyle = "blue";
            var x = (GRID_SIZE/2) + this.pos.x - this.deconstructTime/2;
            var y = (GRID_SIZE/2) + this.pos.y - this.deconstructTime/2
            context.fillRect(x, y, this.deconstructTime, this.deconstructTime);
            context.strokeStyle = this.color;
            context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    class Flyer extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "white";
            this.hp = 9;
            this.immune = 0;
        }
        hurt(type) {
            if (this.immune > 0) return;

            if (type === map.types.PUNCH) {
                this.hp = this.hp - 5;
                this.immune = 70;
            } else {
                this.hp = this.hp - 0.1;
                this.immune = 70;
            }
            if (this.hp <= 0) this.markedForRemoval = true;
        }
        tick() {
            if (this.immune >= 0) {
                this.immune--;
                return;
            }

            var motherPos = findGameObj(map.types.MOTHERSHIP).pos;
            var x = (motherPos.x > this.pos.x) ? this.pos.x + 0.1 : this.pos.x - 0.1;
            var y = (motherPos.y > this.pos.y) ? this.pos.y + 0.1 : this.pos.y - 0.1;
            var newPos = {
                x: x,
                y: y
            }
            attemptMove(this, newPos);
        }
        draw() {
            super.draw();
            context.strokeStyle = "#00f100";
            context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
            context.fillStyle = "black";
            context.fillText(this.hp.toFixed(0), this.pos.x + 3, this.pos.y + 18);

            if (this.immune > 0) {
                context.strokeStyle = "#4d4dff";
                context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
            }
        }
    }

    class Grunt extends GameObject {
        constructor(pos, type, waypoints) {
            super(pos, type);
            this.color = "#ff243b";
            this.hp = 9;
            this.immune = 0;
            this.speed = 0.1;
            this.waypoints = waypoints;
            this.currentTarget = this.waypoints[0];
            this.collidedWithWaypoint(this.currentTarget);
        }
        hurt(type) {
            if (this.immune > 0) return;

            if (type === map.types.SHOT || type === map.types.MINE) {
                this.hp = this.hp - 5;
                this.immune = 70;
            } else {
                this.hp = this.hp - 0.1;
                this.immune = 70;
            }
            if (this.hp <= 0) this.markedForRemoval = true;
        }
        collidedWithWaypoint(waypoint) {
            if (this.currentTarget === waypoint) {
                this.currentTarget = this.waypoints.shift();
                // console.log('New waypoint', this.currentTarget)
            }
        }
        tick() {
            if (this.immune >= 0) {
                this.immune--;
                return;
            }

            const targetPos = this.currentTarget.pos;
            var x = (targetPos.x > this.pos.x) ? this.pos.x + this.speed : this.pos.x - this.speed;
            var y = (targetPos.y > this.pos.y) ? this.pos.y + this.speed : this.pos.y - this.speed;
            var newPos = {
                x: x,
                y: y
            }
            attemptMove(this, newPos);
        }
        draw() {
            super.draw();
            context.fillStyle = "black";
            context.fillText(this.hp.toFixed(0), this.pos.x + 3, this.pos.y + 18);

            if (this.immune > 0) {
                context.strokeStyle = "#4d4dff";
                context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
            }
        }
    }

    class Spawn extends GameObject {
        constructor(pos, type, id) {
            super(pos, type);
            this.id = id;
            this.color = "#606060";
        }
    }

    class Part extends GameObject {
        constructor(pos, type, requirement) {
            super(pos, type);
            this.color = "orange";
            this.distance = GRID_SIZE * 3;
            this.speed = 0.1;
            this.requirement = requirement;
        }
        playerWithinReach(player) {
            var withinX = (player.pos.x < this.pos.x + this.distance && player.pos.x > this.pos.x - this.distance)
            var withinY = (player.pos.y < this.pos.y + this.distance && player.pos.y > this.pos.y - this.distance)
            if (withinX && withinY) {
                return true;
            }
            return false;
        }
        tick() {
            _.chain(gameObjects)
            .filter(function(gO) {
                return gO.type === map.types.PLAYER;
            })
            .filter(function(player) {
                return !player.disabled && this.playerWithinReach(player);
            }.bind(this))
            .each(function(player, idx) {
                if (idx >= this.requirement) {
                    var newPos = {
                        x: this.pos.x,
                        y: this.pos.y
                    }
                    newPos.x = (player.pos.x < this.pos.x) ? this.pos.x - this.speed : this.pos.x + this.speed;
                    newPos.y = (player.pos.y < this.pos.y) ? this.pos.y - this.speed : this.pos.y + this.speed;
                    attemptMove(this, newPos);
                }
            }.bind(this));
        }
        draw() {
            super.draw();
            context.fillStyle = "black";
            context.fillText(this.requirement+1, this.pos.x + 3, this.pos.y + 18)
        }
    }

    class Punch extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#ed007d";
            this.duration = 10;
        }
        tick() {
            this.duration--;
            if (this.duration <= 0) {
                this.markedForRemoval = true;
            }
        }
    }

    class Shot extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#6b0b00";
            this.duration = 10;
        }
        tick() {
            super.tick();
            this.duration--;
            if (this.duration <= 0) {
                this.markedForRemoval = true;
            }
            attemptMove(this, this.pos);
        }
    }

    class Mine extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#19ed00";
        }
        detonate() {
            this.markedForRemoval = true;
            var placementPos = {
                x: this.pos.x,
                y: this.pos.y
            }
            gameObjects.push(new MineShell(placementPos, map.types.MINESHELL));
        }
        tick() {
            super.tick();
            attemptMove(this, this.pos);
        }
    }

    class MineShell extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#005b13";
        }
        draw() {
            context.strokeStyle = this.color;
            context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    class Turret extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "#fde0ff";
            this.scanDelayMax = 300;
            this.scanDelay = this.scanDelayMax;
            this.ammo = 5;
        }
        tick() {
            super.tick();
            this.scanDelay--;
            if (this.scanDelay <= 0 && this.ammo > 0) {
                this.ammo = this.ammo - 1;
                this.scanDelay = this.scanDelayMax;
                _.each([-GRID_SIZE*2,0,+GRID_SIZE*2], function(x) {
                    _.each([-GRID_SIZE*2,0,+GRID_SIZE*2], function(y) {
                        var pos = _.clone(this.pos);
                        pos.x = pos.x + x;
                        pos.y = pos.y + y;
                        gameObjects.push(new Shot(pos, map.types.SHOT));
                    }.bind(this));
                }.bind(this));
            }
        }
        resupply() {
            this.scanDelay = this.scanDelayMax * 1.5;
            this.ammo = 5;
        }
        draw() {
            if (this.ammo === 0) {
                context.strokeStyle = this.color;
                context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
            } else {
                super.draw();
            }
            context.fillStyle = "black";
            context.fillText(this.ammo.toFixed(0), this.pos.x + 3, this.pos.y + 18);
        }
    }

    class Mothership extends GameObject {
        constructor(pos, type) {
            super(pos, type);
            this.color = "green";
            this.hp = 100;
            this.parts = 0;
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
            this.isHoldingPickButton = false;
        }
        tick() {
            if (this.disabled) return;
            this.cooldown--;
            var pad = userInput.readInput()[this.id];
            debugWriteButtons(pad);
            if (!(pad && pad.axes && pad.axes[2] !== null && pad.axes[3] !== null)) return;

            (this.id === 0) && this.checkPunch(pad);

            (this.id === 1) && this.checkPlaceMine(pad);

            (this.id === 1 || this.id === 2) && this.checkPickButton(pad);
            (this.id === 2) && this.checkPlaceTurret(pad);

            var newPos = {
                x: this.pos.x + pad.axes[0],
                y: this.pos.y + pad.axes[1],
            }
            attemptMove(this, newPos);
        }
        checkPickButton(pad) {
            this.isHoldingPickButton = pad.buttons[7].pressed;
        }
        checkPlaceTurret(pad) {
            if (pad.buttons[6].pressed && this.cooldown <= 0 && this.debree > 0) {
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
                gameObjects.push(new Turret(placementPos, map.types.TURRET));

                this.debree = this.debree - 1;
            }
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
            var outlines = ["#ed007d", "#19ed00", "#eb8d00"];
            if (!this.disabled) {
                super.draw();
                context.fillStyle = "white";
                context.fillText(this.debree, this.pos.x + 3, this.pos.y + 18)
            }
            context.beginPath();
            context.lineWidth = "2";
            context.strokeStyle = outlines[this.id];
            context.rect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
            context.stroke();
        }
    }

    class WaveController {
        constructor(waves, waypointCollections) {
            this.waves = waves || [];
            this.currentWave = null;
            this.waypointCollections = waypointCollections;
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
                            var waypoints = _.clone(this.waypointCollections.gruntSpawns[blueprint.spawnIdx]);
                            waypoints.push(findGameObj(map.types.MOTHERSHIP));
                            targetPos.x = (motherPos.x > targetPos.x) ? targetPos.x + GRID_SIZE : targetPos.x - GRID_SIZE;
                            targetPos.y = (motherPos.y > targetPos.y) ? targetPos.y + GRID_SIZE : targetPos.y - GRID_SIZE;
                            gameObjects.push(new Grunt(targetPos, map.types.GRUNT, waypoints));
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
            [map.types.FLYER, map.types.MINE],
            [map.types.FLYER, map.types.MINESHELL],
            [map.types.PART, map.types.FLYER],
            [map.types.PART, map.types.GRUNT],
            [map.types.PART, map.types.DEBREE],
            [map.types.PART, map.types.MINE],
            [map.types.PART, map.types.MINESHELL],
            [map.types.PART, map.types.TURRET],
            [map.types.PART, map.types.PUNCH],
            [map.types.PART, map.types.SHOT]
        ]
        return !!_.find(table, function(filter) {
            return obj1.type === filter[0] && obj2.type === filter[1] ||
                obj2.type === filter[0] && obj1.type === filter[1];
        }) || !obj1.isPhysical || !obj2.isPhysical;
    }

    function collision(obj1, obj2) {
        if (typeCheck(obj1, obj2, map.types.TURRET, map.types.FLYER)) {
            var turret = (obj1.type === map.types.TURRET) ? obj1 : obj2;
            turret.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.TURRET, map.types.GRUNT)) {
            var turret = (obj1.type === map.types.TURRET) ? obj1 : obj2;
            turret.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.TURRET, map.types.PLAYER)) {
            var turret = (obj1.type === map.types.TURRET) ? obj1 : obj2;
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            if (player.id !== 2) return;
            if (player.isHoldingPickButton) {
                turret.markedForRemoval = true;
                player.debree = player.debree + 1;
            } else {
                turret.resupply();
            }
        }
        // -------------------------------------------------------------------
        if (typeCheck(obj1, obj2, map.types.PART, map.types.MOTHERSHIP)) {
            var part = (obj1.type === map.types.PART) ? obj1 : obj2;
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            part.markedForRemoval = true;
            mothership.parts = mothership.parts + 1;
        }
        // -------------------------------------------------------------------

        if (typeCheck(obj1, obj2, map.types.SHOT, map.types.FLYER)) {
            var flyer = (obj1.type === map.types.FLYER) ? obj1 : obj2;
            flyer.hurt(map.types.SHOT);
        }
        if (typeCheck(obj1, obj2, map.types.SHOT, map.types.GRUNT)) {
            var grunt = (obj1.type === map.types.GRUNT) ? obj1 : obj2;
            grunt.hurt(map.types.SHOT);
        }
        if (typeCheck(obj1, obj2, map.types.SHOT, map.types.MOTHERSHIP)) {
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.04;
            screenShaker.shake();
        }
        // -------------------------------------------------------------------


        if (obj1.type === map.types.PLAYER && obj2.type === map.types.PLAYER) {
            obj1.disabled = false;
            obj2.disabled = false;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.SHOT)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.FLYER)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.MINE)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var mine = (obj1.type === map.types.MINE) ? obj1 : obj2;
            if (player.id === 1 && player.isHoldingPickButton) {
                player.debree = player.debree + 1;
                mine.markedForRemoval = true;
            } else {
                player.disabled = true;
                mine.detonate();
            }
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.MINESHELL)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var mineshell = (obj1.type === map.types.MINESHELL) ? obj1 : obj2;
            if (player.id !== 1) return;
            player.debree = player.debree + 1;
            mineshell.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.GRUNT)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, map.types.PLAYER, map.types.DEBREE)) {
            var player = (obj1.type === map.types.PLAYER) ? obj1 : obj2;
            var debree = (obj1.type === map.types.DEBREE) ? obj1 : obj2;
            if (debree.deconstructTime > GRID_SIZE) {
                player.debree = player.debree + 1;
                debree.markedForRemoval = true;
            } else {
                debree.deconstruct();
            }
        }
        // -------------------------------------------------------------------


        if (typeCheck(obj1, obj2, map.types.PUNCH, map.types.FLYER)) {
            var flyer = (obj1.type === map.types.FLYER) ? obj1 : obj2;
            flyer.hurt(map.types.PUNCH);
        }
        if (typeCheck(obj1, obj2, map.types.PUNCH, map.types.GRUNT)) {
            var grunt = (obj1.type === map.types.GRUNT) ? obj1 : obj2;
            grunt.hurt(map.types.PUNCH);
        }
        // -------------------------------------------------------------------


        if (typeCheck(obj1, obj2, map.types.FLYER, map.types.MOTHERSHIP)) {
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.01;
            screenShaker.shake();
        }
        // -------------------------------------------------------------------


        if (typeCheck(obj1, obj2, map.types.GRUNT, map.types.MINE)) {
            var mine = (obj1.type === map.types.MINE) ? obj1 : obj2;
            var grunt = (obj1.type === map.types.GRUNT) ? obj1 : obj2;
            mine.detonate();
            grunt.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, map.types.GRUNT, map.types.MOTHERSHIP)) {
            var mothership = (obj1.type === map.types.MOTHERSHIP) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.03;
            screenShaker.shake();
        }
        // -------------------------------------------------------------------

        // Waypoints
        if ((obj1.type === map.types.GRUNT || obj2.type === map.types.GRUNT) &&
            (obj1.type.match(WAYPOINT_REGEX) || obj2.type.match(WAYPOINT_REGEX))) {
            const grunt = (obj1.type === map.types.GRUNT) ? obj1 : obj2;
            const waypoint = obj1 === grunt ? obj2 : obj1;
            grunt.collidedWithWaypoint(waypoint)
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
            return !legal && !collisionFilterIgnored(gameObject, obj);
        });
        var somethingBlockedY = _.find(gameObjects, function(obj) {
            if (gameObject === obj) return false;
            var legal = (
                (gameObject.pos.x > obj.pos.x + GRID_SIZE) || (gameObject.pos.x + GRID_SIZE < obj.pos.x) ||
                (newPos.y > obj.pos.y + GRID_SIZE) || (newPos.y + GRID_SIZE < obj.pos.y)
            );
            if (!legal) collision(gameObject, obj);
            return !legal && !collisionFilterIgnored(gameObject, obj);
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
                    case map.types.PART1:
                        gameObjects.push(new Part({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PART, 0));
                    break;
                    case map.types.PART2:
                        gameObjects.push(new Part({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PART, 1));
                    break;
                    case map.types.PART3:
                        gameObjects.push(new Part({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.PART, 2));
                    break;
                    case map.types.MINE:
                        gameObjects.push(new Mine({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, map.types.MINE));
                    break;
                }

                // Waypoints
                if (item && item.match(WAYPOINT_REGEX)) {
                    gameObjects.push(new Waypoint({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, item));
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
        if (findGameObj(map.types.MOTHERSHIP).parts >= 3) {
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
            const waypointCollections = {
                gruntSpawns: map.waypointCollections.gruntSpawns.map(function (gruntSpawn) {
                    return gruntSpawn.map(function (waypointName) {
                        return findGameObj(waypointName);
                    })
                }),
                // TODO: do for additional enemy types
            };
            waveController = new WaveController(map.waves, waypointCollections);
            screenShaker = new ScreenShaker();

            context.font="20px Verdana";

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
            context.fillText('Mothership HP: ' + mothership.hp.toFixed(0),400,17);
            context.fillText('Wave ' + waveController.waves.length,900,17);

            screenShaker.restore();
        }
    }
});