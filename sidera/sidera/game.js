(function () {

    'use strict';

    var Entity = sidera.entities.Entity,
        Miner = sidera.entities.Miner,
        Turret = sidera.entities.Turret,
        Generator = sidera.entities.Generator;

    var resolution = { height: 900, width: 1200 },
        mode,
        money = 0,
        context = Miner,
        cursor,
        canPlace = false;

    var newBuilding;

    function render_cursor(ctx) {
        if (!canPlace) return;
        cursor.render(ctx, true);
    }

    function render_status(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "18px sans-serif";
        ctx.fillText('$' + money + ' >> ' + mode, 10, 20);
    }

    function draw(ctx, elapsed) {
        var i, x;

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

        render_cursor(ctx);
        render_status(ctx);
    }

    function drawSet(entities, ctx) {
        var i, x;
        for (i = entities.length - 1; i >= 0; i--) {
            x = entities[i];
            if (!x.render) debugger;
            x.render(ctx);
        }
    }

    function updateSet(entities, elapsed) {
        var entity;
        var dead = entities.dead;
        var index;

        for (var i = entities.length - 1; i >= 0; i--) {
            entity = entities[i];
            if (entity.update) entity.update(elapsed, gameObjects);

            // collect the dead
            if (entity.dead) {
                dead.push(entity);
            }
        }

        // bury the dead
        for (var i = dead.length - 1; i >= 0; i--) {
            index = entities.indexOf(dead[i]);
            entities.splice(index, 1);

            if (dead[i].shoudExplode) {
                var explosion = new sidera.entities.Explosion(dead[i]);
                gameObjects.doodads.push(explosion);
            }
        }
        entities.dead = [];
    }

    function update(elapsed) {

        cursor.targets = [];
        if (cursor.find) cursor.find(cursor, gameObjects);

        updateSet(gameObjects.background, elapsed);
        updateSet(gameObjects.enviroment, elapsed);
        updateSet(gameObjects.friendlies, elapsed);
        updateSet(gameObjects.enemies, elapsed);
        updateSet(gameObjects.doodads, elapsed);
        updateSet(gameObjects.ui, elapsed);

        if (newBuilding) {
            var entity;
            for (var i = gameObjects.friendlies.length - 1; i >= 0; i--) {
                entity = gameObjects.friendlies[i];
                if (entity.whenBuilding) entity.whenBuilding(newBuilding, gameObjects);
            }
            newBuilding = null;
        }

    }

    function setContext(type) {
        if (!type) return;

        var x = (cursor) ? cursor.x : -100;
        var y = (cursor) ? cursor.y : -100;

        context = type;
        cursor = new context();
        cursor.x = x;
        cursor.y = y;
        mode = cursor.type;
    }

    function sendWaveOf(type) {

        for (var i = 3; i > 0; i--) {
            var f = new type();
            f.x = -50 - (i * 25);
            f.y = -50 - (i * 25);
            gameObjects.enemies.push(f);
        }
    }

    var gameObjects = buildGameObjectSets();

    function buildGameObjectSets() {

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

        gameObjects = buildGameObjectSets();

        money = 10000;
        sidera.levels.next(gameObjects, resolution);
        setContext(Miner);

        gameObjects.ui.push(new sidera.FPS());
    }

    function handle_click(evt) {

        if (!context.cost) throw new Error('no cost for context: ' + context);

        if (money < context.cost) return;

        money -= context.cost;

        var entity = new context();
        entity.hydrate({
            x: evt.offsetX,
            y: evt.offsetY,
            onmining: function (take) {
                money += take;
            }
        });
        gameObjects.friendlies.push(entity);
        newBuilding = entity;
    }

    function handle_mouseover(evt) {
        cursor.x = evt.offsetX;
        cursor.y = evt.offsetY;
        canPlace = cursor.canPlace(gameObjects.friendlies);
    }

    function handle_onkeypress(evt) {

        // pressed escape
        if (evt.keyCode === 27) {
            this.transition(sidera.start.screen);
        }

        var types = {
            49: Miner,
            50: Generator,
            51: Turret
        };

        if (types[evt.keyCode]) {
            setContext(types[evt.keyCode]);
        } else {
            switch (evt.char) {
                case 'q':
                    sendWaveOf(sidera.entities.Fighter);
                    break;
                case 'w':
                    sendWaveOf(sidera.entities.Bomber);
                    break;
            }
        }
    }

    WinJS.Namespace.define('sidera.game', {
        draw: draw,
        update: update,
        start: start,
        mouseover: handle_mouseover,
        onkeypress: handle_onkeypress,
        click: handle_click
    });

}());