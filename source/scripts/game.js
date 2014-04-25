define(function (require) {

    var Explosion = require('entities/Explosion'),
        keyboard = require('input/keyboard'),
        input = require('input/provider'),
        Camera = require('Camera'),
        levels = require('levels'),
        MapGrid = require('entities/MapGrid'),
        Status = require('ui/status'),
        MiniMap = require('ui/minimap'),
        Builder = require('ui/Builder'),
        Menu = require('ui/Menu'),
        FPS = require('ui/fps');

    var resolution = require('resolution');

    var gameObjects;
    var level;
    var camera;
    var isGameOver = false;
    var isPaused = false;
    var escapeRequested = false;

    var actionCount = 1;
    var temporalSpeed = 4;
    var maxTemporalSpeed = 4;

    var commands = {
        80 /* p */: {
            command: function () { isPaused = !isPaused; },
            delay: 300
        },

        189 /* - */: {
            command: function () {
                if (temporalSpeed < maxTemporalSpeed) {
                    temporalSpeed += 1;
                }
            }
        },

        187 /* + */: {
            command: function () {
                if (temporalSpeed > 1) {
                    temporalSpeed -= 1;
                }
            }
        }
    };

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
            ui: entityArray(),
            paused: entityArray()
        };
    }

    function start(options) {

        keyboard.mixinKeyCheck(this);

        this.exitScreen = options.exitScreen;

        isGameOver = false;
        camera = new Camera();
        gameObjects = initializeGameObjectSets();

        gameObjects.background.push(new MapGrid());

        level = levels.next(gameObjects);
        gameObjects.ui.push(level);
        camera.animateTo(level.camera);

        gameObjects.ui.push(new Builder(camera, gameObjects, level));
        gameObjects.ui.push(new MiniMap(gameObjects, camera));
        gameObjects.ui.push(new FPS());
        gameObjects.ui.push(new Status(level));

        gameObjects.paused.push(new Menu());
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

        if (isPaused) {
            drawSet(gameObjects.paused, ctx);
        }

        if (isGameOver) {
            var centerText = function (ctx, text, y) {
                var measurement = ctx.measureText(text);
                var x = (ctx.canvas.width - measurement.width) / 2;
                ctx.fillText(text, x, y);
            };

            ctx.fillStyle = 'white';
            ctx.font = '48px monospace';
            centerText(ctx, 'game over', 300);
        }

        // TODO: move to an entity?
        ctx.fillStyle = 'white';
        ctx.font = '16px monospace';
        var speedText = (maxTemporalSpeed - temporalSpeed + 1) + 'x';
        var measurement = ctx.measureText(speedText);
        ctx.fillText(speedText, resolution.width - measurement.width - 50, 50);
    }

    function drawSet(entities, ctx) {
        var i, entity;
        var sprite;
        for (i = entities.length - 1; i >= 0; i--) {
            entity = entities[i];
            entity.render(ctx, camera);
        }
    }

    function update(elapsed) {

        input.update(elapsed);
        this.checkCommands();

        actionCount = actionCount + 1;
        if (actionCount > temporalSpeed) { actionCount = 1; }
        if (actionCount % temporalSpeed === 0) {

            updateSet(gameObjects.background, elapsed);
            updateSet(gameObjects.enviroment, elapsed);

            if (isPaused) {
                updateSet(gameObjects.paused, elapsed);
            } else {
                updateSet(gameObjects.friendlies, elapsed);
                updateSet(gameObjects.enemies, elapsed);

                updateSet(gameObjects.doodads, elapsed);
                updateSet(gameObjects.ui, elapsed);
            }
        }

        camera.update(elapsed);

        if (gameObjects.friendlies.length === 0) {
            isGameOver = true;
        }

        // TODO: this action needs to be trigger on keyup only
        // that is not currently support by the keyboard module
        if (escapeRequested && !keyboard.isKeyPressed(27)) {
            // pressed escape
            this.transition(this.exitScreen);
        }

        escapeRequested = keyboard.isKeyPressed(27);
    }

    function updateSet(entities, elapsed) {
        var entity;
        var dead = entities.dead;
        var index;
        var i;

        for (i = entities.length - 1; i >= 0; i--) {
            entity = entities[i];
            if (entity.update) entity.update(elapsed, gameObjects);

            // collect the dead
            if (entity.dead) {
                dead.push(entity);
            }
        }

        // bury the dead
        for (i = dead.length - 1; i >= 0; i--) {
            index = entities.indexOf(dead[i]);
            entities.splice(index, 1);

            if (dead[i].shoudExplode) {
                var explosion = new Explosion(dead[i]);
                gameObjects.doodads.push(explosion);
            }
        }
        entities.dead = [];
    }

    return {
        draw: draw,
        update: update,
        start: start,
        commands: commands
    };

});