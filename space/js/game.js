(function () {

    'use strict';

    var Entity = space.Entity,
        Miner = space.Miner,
        Asteroid = space.Asteroid,
        Generator = space.Generator;

    var geo = space.geometry,
        vector = space.vector;

    var resolution = { height: 900, width: 1200 };

    var entities = [];
    var mode;
    var money = 0;
    var context = Miner;
    var cursor;

    Entity.prototype.destroy = function () {
        var index = entities.indexOf(this);
        entities.splice(index, 1);
    };

    setContext(Miner);

    var canPlace = false;

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

        ctx.clearRect(0, 0, resolution.width, resolution.height);

        render_background(ctx);

        entities.forEach(function (x) {
            if (!x.render) debugger;
            x.render(ctx);
        });

        render_cursor(ctx);
        render_status(ctx);
    }

    function update(elapsed) {

        cursor.targets = [];
        if (cursor.find) cursor.find(cursor, entities);

        entities.forEach(function (entity) {
            if (entity.update) entity.update(elapsed, entities);
        });
    }

    function loadLevel(done) {
        console.log('load level');
        var request = new XMLHttpRequest();
        request.open('GET', '/level.json', false);
        request.send(null);

        if (request.status === 200) {
            var responseText = JSON.stringify({
                'things': [{
                    'type': 'asteroid',
                    'x': 100,
                    'y': 100,
                    'amount': 1000
                }, {
                    type: 'asteroid',
                    x: 300,
                    y: 100,
                    amount: 500
                }]
            });
            //var data = JSON.parse(request.responseText);
            var data = JSON.parse(responseText);
            money = 1000;
            data.things.forEach(function (x) {
                var a = new Asteroid();
                a.hydrate(x);
                entities.push(a);
            });
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
            50: Generator
        };
        setContext(types[evt.keyCode]);
    }

    function start() {
        loadLevel();
    }

    WinJS.Namespace.define('space.game', {
        draw: draw,
        update: update,
        start: start,
        mouseover: handle_mouseover,
        onkeypress: handle_onkeypress,
        click: handle_click,
        resolution: resolution
    });

}());