define(function(require) {

    var Explosion = require('entities/Explosion'),
        keyboard = require('input/keyboard'),
        input = require('input/provider'),
        Camera = require('Camera'),
        levels = require('levels'),
        MapGrid = require('entities/MapGrid'),
        Status = require('status'),
        MiniMap = require('minimap'),
        Builder = require('ui/Builder'),
        FPS = require('fps');

    var gameObjects;
    var level;
    var camera;
    var isGameOver = false;

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
        camera = new Camera();
        gameObjects = initializeGameObjectSets();

        gameObjects.background.push(new MapGrid());

        level = levels.next(gameObjects);
        gameObjects.ui.push(level);

        gameObjects.ui.push(new Builder(camera, gameObjects, level));
        gameObjects.ui.push(new MiniMap(gameObjects, camera));
        gameObjects.ui.push(new FPS());
        gameObjects.ui.push(new Status(level));
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

    function update(elapsed) {

        input.update();
        // keyboard.update();
        updateSet(gameObjects.background, elapsed);
        updateSet(gameObjects.enviroment, elapsed);
        updateSet(gameObjects.friendlies, elapsed);
        updateSet(gameObjects.enemies, elapsed);
        updateSet(gameObjects.doodads, elapsed);
        updateSet(gameObjects.ui, elapsed);

        camera.update();

        if(gameObjects.friendlies.length === 0 && level.money < 9999) {
            isGameOver = true;
        }

        if(keyboard.isKeyPressed(27)) {
            // pressed escape
            this.transition(startScreen);
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
                var explosion = new Explosion(dead[i]);
                gameObjects.doodads.push(explosion);
            }
        }
        entities.dead = [];
    }

    return {
        draw: draw,
        update: update,
        start: start
    };

});