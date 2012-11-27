(function() {

    'use strict';

    var Entity = sidera.entities.Entity,
        Miner = sidera.entities.Miner,
        Turret = sidera.entities.Turret,
        Generator = sidera.entities.Generator;

    var newBuilding;
    var gameObjects;
    var status;
    var cursor;
    var camera;
    var isGameOver = false;

    var CommandBar = sidera.framework.class.derive(Entity, function() {
        Entity.prototype.constructor.call(this, 'CommandBar');

        this.x = sidera.resolution.width - 100;
        this.y = 50;

        this.commands = [{
            key: 49,
            action: Miner
        }, {
            key: 50,
            action: Generator
        }, {
            key: 51,
            action: Turret
        }];

    }, {
        state: null,
        render: function(ctx) {
            var h = this.commands.length * 50 + 8;

            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.beginPath();
            ctx.rect(0, 0, 100, h);
            ctx.fillStyle = 'rgba(128,128,128,0.7)';
            ctx.fill();

            this.commands.forEach(function(command, index) {
                var y = index * 50 + 8;
                ctx.beginPath();
                ctx.rect(8, y, 84, 42);
                ctx.fillStyle = 'rgba(128,128,128,0.7)';
                ctx.fill();


                // hack
                var _entity = new command.action();

                ctx.fillStyle = "white";
                ctx.font = "8px sans-serif";
                ctx.fillText(_entity.type, 12, y + 8);
            });

            ctx.restore();
        },
        update: function() {

        }
    });

    function initializeGameObjectSets() {

        function entityArray() {
            var array = [];
            array.dead = [];
            return array;
        }

        return {
            background: entityArray(),
            enviroment: entityArray(),
            enemies: entityArray(),
            friendlies: entityArray(),
            doodads: entityArray(),
            ui: entityArray()
        };
    }

    function start(options) {

        isGameOver = false;
        camera = new sidera.Camera(sidera.resolution);
        cursor = new sidera.Cursor(camera);
        gameObjects = initializeGameObjectSets();

        gameObjects.background.push(new sidera.entities.MapGrid());

        var level = sidera.levels.next(gameObjects);
        cursor.setContext(Miner);

        status = new sidera.Status(level);
        gameObjects.ui.push(new CommandBar());
        gameObjects.ui.push(new sidera.MiniMap(gameObjects, camera));
        gameObjects.ui.push(new sidera.FPS());
        gameObjects.ui.push(status);
    }

    function draw(ctx, elapsed) {

        var width = ctx.canvas.width;
        var height = ctx.canvas.height;

        ctx.clearRect(0, 0, width, height);

        // draw background
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        // draw entities
        drawSet(gameObjects.background, ctx);

        drawSet(gameObjects.enviroment, ctx);
        drawSet(gameObjects.friendlies, ctx);
        drawSet(gameObjects.enemies, ctx);
        drawSet(gameObjects.doodads, ctx);
        drawSet(gameObjects.ui, ctx);

        cursor.render(ctx, camera);

        if(isGameOver) {
            var centerText = function(ctx, text, y) {
                    var measurement = ctx.measureText(text);
                    var x = (ctx.canvas.width - measurement.width) / 2;
                    ctx.fillText(text, x, y);
                };

            ctx.fillStyle = 'white';
            ctx.font = '48px monospace';
            centerText(ctx, 'game over', 300);
        }
    }

    function drawSet(entities, ctx) {
        var i, entity;
        var sprite;
        for(i = entities.length - 1; i >= 0; i--) {
            entity = entities[i];
            entity.render(ctx, camera);
        }
    }

    function updateSet(entities, elapsed) {
        var entity;
        var dead = entities.dead;
        var index;

        for(var i = entities.length - 1; i >= 0; i--) {
            entity = entities[i];
            if(entity.update) entity.update(elapsed, gameObjects);

            // collect the dead
            if(entity.dead) {
                dead.push(entity);
            }
        }

        // bury the dead
        for(var i = dead.length - 1; i >= 0; i--) {
            index = entities.indexOf(dead[i]);
            entities.splice(index, 1);

            if(dead[i].shoudExplode) {
                var explosion = new sidera.entities.Explosion(dead[i]);
                gameObjects.doodads.push(explosion);
            }
        }
        entities.dead = [];
    }

    function update(elapsed) {

        status.mode = cursor.mode;

        updateSet(gameObjects.background, elapsed);
        updateSet(gameObjects.enviroment, elapsed);
        updateSet(gameObjects.friendlies, elapsed);
        updateSet(gameObjects.enemies, elapsed);
        updateSet(gameObjects.doodads, elapsed);
        updateSet(gameObjects.ui, elapsed);

        cursor.update(elapsed, gameObjects);
        camera.update();

        if(newBuilding) {
            var entity;
            for(var i = gameObjects.friendlies.length - 1; i >= 0; i--) {
                entity = gameObjects.friendlies[i];
                if(entity.whenBuilding) entity.whenBuilding(newBuilding, gameObjects);
            }
            newBuilding = null;
        }

        if(gameObjects.friendlies.length === 0 && status.state.money < 9999) {
            isGameOver = true;
        }

        if(sidera.keyboard.isKeyPressed(27)) {
            // pressed escape
            this.transition(sidera.start.screen);
        }

        handleInput();
        var mouseState = sidera.mouse.getState();
        if(mouseState.buttonPressed) {
            handle_click(mouseState);
        }
    }

    function sendWaveOf(type) {
        var now = new Date();
        if(sendWaveOf.lastTime && (now - sendWaveOf.lastTime < 500)) {
            return;
        }
        sendWaveOf.lastTime = now;
        for(var i = 3; i > 0; i--) {
            var f = new type();
            f.x = -1 - (i * 1.1);
            f.y = -1 - (i * 1.1);
            gameObjects.enemies.push(f);
        }
    }

    function handle_click(mouseState) {
        if(!cursor.overValidPlacement) {
            return;
        }
        var screenCoords = mouseState;
        var worldCoords = camera.toWorldSpace(screenCoords);
        worldCoords.x = Math.round(worldCoords.x);
        worldCoords.y = Math.round(worldCoords.y);
        var entity = cursor.click(worldCoords, sidera.levels.current, gameObjects);

        if(entity) {
            gameObjects.friendlies.push(entity);
            newBuilding = entity;
        }
    }

    function handleInput() {

        //TODO: this whole bit needs to go
        var keyboard = sidera.keyboard;

        if(keyboard.isKeyPressed(81)) {
            //q
            sendWaveOf(sidera.entities.Fighter);
        }
        if(keyboard.isKeyPressed(69)) {
            //e
            sendWaveOf(sidera.entities.Bomber);
        }

        var types = {
            49: Miner,
            50: Generator,
            51: Turret
        };

        Object.keys(types).forEach(function(key) {

            if(keyboard.isKeyPressed(key)) {
                cursor.setContext(types[key]);
            }
        });
    }

    sidera.framework.namespace.define('sidera.game', {
        draw: draw,
        update: update,
        start: start
    });

}());