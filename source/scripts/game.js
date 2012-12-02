define(['status', 'minimap', 'fps', 'Camera', 'Cursor', 'levels', 'entities/Miner', 'entities/Turret', 'entities/Generator', 'entities/Explosion', 'ui/CommandBar'], function(Status, MiniMap, FPS) {

    var Miner = require('entities/Miner'),
        Turret = require('entities/Turret'),
        Generator = require('entities/Generator'),
        CommandBar = require('ui/CommandBar'),
        keyboard = require('keyboard'),
        mouse = require('mouse'),
        resolution = require('resolution'),
        Camera = require('Camera'),
        Cursor = require('Cursor'),
        levels = require('levels'),
        MapGrid = require('entities/MapGrid');

    var newBuilding;
    var gameObjects;
    var status;
    var cursor;
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
        camera = new Camera(resolution);
        cursor = new Cursor(camera);
        gameObjects = initializeGameObjectSets();

        gameObjects.background.push(new MapGrid());

        var level = levels.next(gameObjects);
        cursor.setContext(Miner);

        status = new Status(level);
        gameObjects.ui.push(new CommandBar());
        gameObjects.ui.push(new MiniMap(gameObjects, camera));
        gameObjects.ui.push(new FPS());
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

        if(keyboard.isKeyPressed(27)) {
            // pressed escape
            this.transition(startScreen);
        }

        handleInput();

        delegateMouse(mouse.getState(), gameObjects.ui);
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

    function delegateMouse(mouseState, uiElements) {
        var i, element;
        var handled = false;

        for(i = uiElements.length - 1; i >= 0; i--) {
            element = uiElements[i];

            if(element.handleMouse && element.bounds && mouseState.isCursorOver(element.bounds)) {
                handled = element.handleMouse(mouseState);

            }
            if(handled) {
                break;
            }
        }

        cursor.on = !handled;

        if(!handled && mouseState.buttonPressed) {
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
        var entity = cursor.click(worldCoords, levels.current, gameObjects);

        if(entity) {
            gameObjects.friendlies.push(entity);
            newBuilding = entity;
        }
    }

    function handleInput() {

        //TODO: this whole bit needs to go
        if(keyboard.isKeyPressed(81)) {
            //q
            sendWaveOf(Fighter);
        }
        if(keyboard.isKeyPressed(69)) {
            //e
            sendWaveOf(Bomber);
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

    return {
        draw: draw,
        update: update,
        start: start
    };

});