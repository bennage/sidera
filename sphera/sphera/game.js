(function () {

    'use strict';

    var Entity = sphera.entities.Entity,
        Miner = sphera.entities.Miner,
        Turret = sphera.entities.Turret,
        Generator = sphera.entities.Generator;

    var resolution = { height: 900, width: 1200 },
        entities = [],
        mode,
        money = 0,
        context = Miner,
        cursor,
        canPlace = false;

    function render_background(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, resolution.width, resolution.height);
    }

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

        ctx.clearRect(0, 0, resolution.width, resolution.height);

        render_background(ctx);

        for (i = entities.length - 1; i >= 0; i--) {
            x = entities[i];
            if (!x.render) debugger;
            x.render(ctx);
        }

        render_cursor(ctx);
        render_status(ctx);
    }

    function update(elapsed) {
        var i, x;
        var dead = [], index;

        cursor.targets = [];
        if (cursor.find) cursor.find(cursor, entities);

        for (i = entities.length - 1; i >= 0; i--) {
            x = entities[i];
            if (x.update) x.update(elapsed, entities);

            // collect the dead
            if (x.dead) {
                dead.push(x);
            }
        }

        // bury the dead
        for (i = dead.length - 1; i >= 0; i--) {
            index = entities.indexOf(dead[i]);
            entities.splice(index, 1);

            if (dead[i].shoudExplode) {
                var explosion = new sphera.entities.Explosion(dead[i]);
                entities.push(explosion);
            }
        }
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
        entities.push(entity);
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

    function handle_mouseover(evt) {
        cursor.x = evt.offsetX;
        cursor.y = evt.offsetY;
        canPlace = cursor.canPlace(entities);
    }

    function handle_onkeypress(evt) {
        var types = {
            49: Miner,
            50: Generator,
            51: Turret
        };
        if (types[evt.keyCode]) {
            setContext(types[evt.keyCode]);
        } else {
            wave();
        }
    }

    function wave() {

        for (var i = 7; i > 0; i--) {
            var f = new sphera.entities.Fighter();
            f.x = -50 - (i * 25);
            f.y = -50 - (i * 25);
            entities.push(f);
        }
    }

    function start() {
        money = 10000;
        sphera.levels.next(entities, resolution);
        setContext(Miner);
    }

    WinJS.Namespace.define('sphera.game', {
        draw: draw,
        update: update,
        start: start,
        mouseover: handle_mouseover,
        onkeypress: handle_onkeypress,
        click: handle_click,
        resolution: resolution
    });

}());