define('game', [
    'underscore',
    'userInput',
    'map',
    'types'
], function (
    _,
    userInput,
    map,
    types
) {
    //Refactor:
    // - Red ut "types" och index. Player med index 1,2,3 osv. Waves ska kunna peka ut SPAWN1 och inte bara ett index
    // - Classer behöver TYPES som input, helt redundant

    // 144 or 60
    var DEBUG_WRITE_BUTTONS = false;
    var DEBUG_DRAW_WAYPOINTS = false;
    var DEBUG_DRAW_3D = false;
    var FULLSCREEN = false;
    var DEBUG_EXPOSE_TO_WINDOW = false;

    const FPS = 144;
    const WAYPOINT_REGEX = /W[0-9](G|F)[0-9]/g;

    let gameObjects = [];
    let spawnObjects = [];
    let waveController = null;
    let screenShaker = null;
    
    const GRID_SIZE = 20;

    var playerImg = new Image();
    playerImg.src = "player.png";

    var images = {
        player: playerImg
    }

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    function debugWriteButtons(pad) {
        if (!DEBUG_WRITE_BUTTONS) return;
        _.each(pad && pad.buttons, function(button, idx) {
            if (button.pressed) console.log(idx + " pressed");
        })
    }

    class GameObject {
        constructor(pos) {
            this.pos = pos;
            this.markedForRemoval = false;
            this.color = "#FFFF00";
            this.isSensor = false;
        }
        remove () {
            return this.markedForRemoval;
        }
        tick() {}
        draw() {
            context.fillStyle = this.color;
            context.fillRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
        draw3d() {

        }
    }

    class Wall extends GameObject {
        constructor(pos) {
            super(pos);
            this.color = "black";
        }
    }

    class Waypoint extends GameObject {
        constructor(pos, mapString) {
            super(pos);
            this.mapString = mapString;
            this.color = "#FFAAAA";
            this.isSensor = true;
        }
        draw() {
            if (DEBUG_DRAW_WAYPOINTS) {
                super.draw();
                context.fillStyle = "#FF00FF";
                context.fillText(this.mapString, this.pos.x + 3, this.pos.y + 18);
            }
        }
    }

    class Debree extends GameObject {
        constructor(pos) {
            super(pos);
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
        constructor(pos) {
            super(pos);
            this.color = "white";
            this.hp = 9;
            this.immune = 0;
        }
        hurt(obj) {
            if (this.immune > 0) return;

            if (obj instanceof Punch) {
                this.hp = this.hp - 5;
                this.immune = 70;
            } else {
                this.hp = this.hp - 1;
                this.immune = 70;
            }
            if (this.hp <= 0) this.markedForRemoval = true;
        }
        tick() {
            if (this.immune >= 0) {
                this.immune--;
                return;
            }

            var motherPos = findGameObj(Mothership).pos;
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
        constructor(pos, waypoints) {
            super(pos);
            this.color = "#ff243b";
            this.hp = 9;
            this.immune = 0;
            this.speed = 0.1;
            this.waypoints = waypoints;
            this.currentTarget = this.waypoints[0];
            this.collidedWithWaypoint(this.currentTarget);
        }
        hurt(obj) {
            if (this.immune > 0) return;

            if (obj instanceof Shot || obj instanceof Mine) {
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
        constructor(pos, id) {
            super(pos);
            this.id = id;
            this.color = "#606060";
        }
    }

    class Part extends GameObject {
        constructor(pos, requirement) {
            super(pos);
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
            .filter(function(gameObject) {
                return gameObject instanceof Player;
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
        constructor(pos) {
            super(pos);
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
        constructor(pos) {
            super(pos);
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
        constructor(pos) {
            super(pos);
            this.color = "#19ed00";
        }
        detonate() {
            this.markedForRemoval = true;
            var placementPos = {
                x: this.pos.x,
                y: this.pos.y
            }
            gameObjects.push(new MineShell(placementPos));
        }
        tick() {
            super.tick();
            attemptMove(this, this.pos);
        }
    }

    class MineShell extends GameObject {
        constructor(pos) {
            super(pos);
            this.color = "#005b13";
        }
        draw() {
            context.strokeStyle = this.color;
            context.strokeRect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
        }
    }

    class Turret extends GameObject {
        constructor(pos) {
            super(pos);
            this.color = "#fde0ff";
            this.scanDelayMax = 300;
            this.scanDelay = this.scanDelayMax;
            this.ammo = 10;
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
                        gameObjects.push(new Shot(pos));
                    }.bind(this));
                }.bind(this));
            }
        }
        resupply() {
            this.scanDelay = this.scanDelayMax * 1.5;
            this.ammo = 10;
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
        constructor(pos) {
            super(pos);
            this.color = "green";
            this.hp = 100;
            this.parts = 0;
        }
    }

    class Player extends GameObject {
        constructor(pos, id) {
            super(pos);
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
                gameObjects.push(new Turret(placementPos));

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
                gameObjects.push(new Mine(placementPos));

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
                gameObjects.push(new Punch(firstPos));
                var secondPos = _.clone(this.pos);
                secondPos.x = secondPos.x + modifier2.x;
                secondPos.y = secondPos.y + modifier2.y;
                gameObjects.push(new Punch(secondPos));
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
        draw3d() {
            context.drawImage(images.player, this.pos.x, this.pos.y - 35);
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
                        case types.FLYER:
                            var targetPos = _.clone(findGameObjWithIndex(Spawn, blueprint.spawnIdx).pos);
                            var motherPos = findGameObj(Mothership).pos;
                            targetPos.x = (motherPos.x > targetPos.x) ? targetPos.x + GRID_SIZE : targetPos.x - GRID_SIZE;
                            targetPos.y = (motherPos.y > targetPos.y) ? targetPos.y + GRID_SIZE : targetPos.y - GRID_SIZE;
                            gameObjects.push(new Flyer(targetPos));
                        break;
                        case types.GRUNT:
                            var targetPos = _.clone(findGameObjWithIndex(Spawn, blueprint.spawnIdx).pos);
                            var motherPos = findGameObj(Mothership).pos;
                            var waypoints = _.clone(this.waypointCollections.gruntSpawns[blueprint.spawnIdx]);
                            waypoints.push(findGameObj(Mothership));
                            targetPos.x = (motherPos.x > targetPos.x) ? targetPos.x + GRID_SIZE : targetPos.x - GRID_SIZE;
                            targetPos.y = (motherPos.y > targetPos.y) ? targetPos.y + GRID_SIZE : targetPos.y - GRID_SIZE;
                            gameObjects.push(new Grunt(targetPos, waypoints));
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

    function findGameObj(klass) {
        return _.find(gameObjects, function(item) {
            return item instanceof klass;
        });
    }

    function findGameObjWithIndex(klass, idx) {
        return _.find(gameObjects, function(item) {
            return item instanceof klass && item.id === idx;
        })
    }

    function findGameObjByMapString(mapString) {
        return _.find(gameObjects, function(item) {
            return item.mapString === mapString;
        })
    }

    function typeCheck(obj1, obj2, klass1, klass2) {
        return (obj1 instanceof klass1 && obj2 instanceof klass2 || obj2 instanceof klass1 && obj1 instanceof klass2)
    }

    function collisionFilterIgnored(obj1, obj2) {
        //Every pair here ignores collisions
        var table = [
            [Flyer, Mine],
            [Flyer, MineShell],
            [Part, Flyer],
            [Part, Grunt],
            [Part, Debree],
            [Part, Mine],
            [Part, MineShell],
            [Part, Turret],
            [Part, Punch],
            [Part, Shot],
            [MineShell, Grunt]
        ]
        return !!_.find(table, function(filter) {
            return typeCheck(obj1, obj2, filter[0], filter[1]);
        }) || obj1.isSensor || obj2.isSensor;
    }

    function collision(obj1, obj2) {
        if (typeCheck(obj1, obj2, Turret, Flyer)) {
            var turret = (obj1 instanceof Turret) ? obj1 : obj2;
            turret.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, Turret, Grunt)) {
            var turret = (obj1 instanceof Turret) ? obj1 : obj2;
            turret.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, Turret, Player)) {
            var turret = (obj1 instanceof Turret) ? obj1 : obj2;
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            if (player.id !== 2) return;
            if (player.isHoldingPickButton) {
                turret.markedForRemoval = true;
                player.debree = player.debree + 1;
            } else {
                turret.resupply();
            }
        }
        // -------------------------------------------------------------------
        if (typeCheck(obj1, obj2, Part, Mothership)) {
            var part = (obj1 instanceof Part) ? obj1 : obj2;
            var mothership = (obj1 instanceof Mothership) ? obj1 : obj2;
            part.markedForRemoval = true;
            mothership.parts = mothership.parts + 1;
        }
        // -------------------------------------------------------------------

        if (typeCheck(obj1, obj2, Shot, Flyer)) {
            var flyer = (obj1 instanceof Flyer) ? obj1 : obj2;
            flyer.hurt(Shot);
        }
        if (typeCheck(obj1, obj2, Shot, Grunt)) {
            var grunt = (obj1 instanceof Grunt) ? obj1 : obj2;
            grunt.hurt(Shot);
        }
        if (typeCheck(obj1, obj2, Shot, Mothership)) {
            var mothership = (obj1 instanceof Mothership) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.04;
            screenShaker.shake();
        }
        // -------------------------------------------------------------------


        if (obj1 instanceof Player && obj2 instanceof Player) {
            obj1.disabled = false;
            obj2.disabled = false;
        }
        if (typeCheck(obj1, obj2, Player, Shot)) {
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, Player, Flyer)) {
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, Player, Mine)) {
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            var mine = (obj1 instanceof Mine) ? obj1 : obj2;
            if (player.id === 1 && player.isHoldingPickButton) {
                player.debree = player.debree + 1;
                mine.markedForRemoval = true;
            } else {
                player.disabled = true;
                mine.detonate();
            }
        }
        if (typeCheck(obj1, obj2, Player, MineShell)) {
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            var mineshell = (obj1 instanceof MineShell) ? obj1 : obj2;
            if (player.id !== 1) return;
            player.debree = player.debree + 1;
            mineshell.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, Player, Grunt)) {
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            player.disabled = true;
        }
        if (typeCheck(obj1, obj2, Player, Debree)) {
            var player = (obj1 instanceof Player) ? obj1 : obj2;
            var debree = (obj1 instanceof Debree) ? obj1 : obj2;
            if (debree.deconstructTime > GRID_SIZE) {
                player.debree = player.debree + 1;
                debree.markedForRemoval = true;
            } else {
                debree.deconstruct();
            }
        }
        // -------------------------------------------------------------------


        if (typeCheck(obj1, obj2, Punch, Flyer)) {
            var flyer = (obj1 instanceof Flyer) ? obj1 : obj2;
            flyer.hurt(Punch);
        }
        if (typeCheck(obj1, obj2, Punch, Grunt)) {
            var grunt = (obj1 instanceof Grunt) ? obj1 : obj2;
            grunt.hurt(Punch);
        }
        // -------------------------------------------------------------------


        if (typeCheck(obj1, obj2, Flyer, Mothership)) {
            var mothership = (obj1 instanceof Mothership) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.01;
            screenShaker.shake();
        }
        // -------------------------------------------------------------------


        if (typeCheck(obj1, obj2, Grunt, Mine)) {
            var mine = (obj1 instanceof Mine) ? obj1 : obj2;
            var grunt = (obj1 instanceof Grunt) ? obj1 : obj2;
            mine.detonate();
            grunt.markedForRemoval = true;
        }
        if (typeCheck(obj1, obj2, Grunt, Mothership)) {
            var mothership = (obj1 instanceof Mothership) ? obj1 : obj2;
            mothership.hp = mothership.hp - 0.03;
            screenShaker.shake();
        }
        // -------------------------------------------------------------------

        // Waypoints
        if (typeCheck(obj1, obj2, Grunt, Waypoint)) {
            const grunt = (obj1 instanceof Grunt) ? obj1 : obj2;
            const waypoint = (obj1 instanceof Waypoint) ? obj1 : obj2;
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
                if (!item) return;

                if (typeof item === "string") {
                    switch(item) {
                        case types.WALL:
                            gameObjects.push(new Wall({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}));
                        break;
                        case types.DEBREE:
                            gameObjects.push(new Debree({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}));
                        break;
                        case types.MOTHERSHIP:
                            gameObjects.push(new Mothership({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}));
                        break;
                        case types.MINE:
                            gameObjects.push(new Mine({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}));
                        break;
                    }
                    // Waypoints
                    if (item && item.match(WAYPOINT_REGEX)) {
                        gameObjects.push(new Waypoint({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, item));
                    }
                } else {
                    //We found a item with both type and id, ie an {}
                    switch(item.type) {
                        case types.PLAYER:
                            gameObjects.push(new Player({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, item.id));
                        break;
                        case types.SPAWN:
                            gameObjects.push(new Spawn({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, item.id));
                        break;
                        case types.PART:
                            gameObjects.push(new Part({x: colIdx * GRID_SIZE, y: rowIdx * GRID_SIZE}, item.id));
                        break;
                    }

                }
            });
        });
    }

    function allEnemiesOnMap() {
        return _.filter(gameObjects, function(item) {
            return item instanceof Flyer || item instanceof Grunt;
        });
    }

    function endConditions() {
        if (waveController.waves.length === 0 && allEnemiesOnMap().length === 0) {
            return 1;
        }
        if (findGameObj(Mothership).parts >= 3) {
            return 1;
        }
        if (findGameObj(Mothership).hp <= 0) {
            return 2;
        }
        if (
            findGameObjWithIndex(Player, 0).disabled &&
            findGameObjWithIndex(Player, 1).disabled &&
            findGameObjWithIndex(Player, 2).disabled
        ) {
            return 2;
        }
        return false;
    }

    if (DEBUG_EXPOSE_TO_WINDOW) {
        window.gameObjects = gameObjects;
    }

    return {
        init: function() {
            generateMap();
            const waypointCollections = {
                gruntSpawns: map.waypointCollections.gruntSpawns.map(function (gruntSpawn) {
                    return gruntSpawn.map(function (waypointName) {
                        return findGameObjByMapString(waypointName);
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

            if (DEBUG_DRAW_3D) {
                _.each(gameObjects, function(gameObject) {
                    gameObject.draw3d();
                });
            }

            //GUI
            context.fillStyle = "white"
            var mothership = findGameObj(Mothership);
            context.fillText('Mothership HP: ' + mothership.hp.toFixed(0),400,17);
            context.fillText('Wave ' + waveController.waves.length,900,17);

            screenShaker.restore();
        }
    }
});