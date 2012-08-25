(function () {

    'use strict';

    function draw(ctx, elapsed) {
        var i, x;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '18px sans-serif';
        ctx.fillText('welcome', 10, 20);
    }

    function update() {

    }

    function click() {
        this.transition(sphera.game, { level: 1 });
    }

    WinJS.Namespace.define('sphera.start.screen', {
        draw: draw,
        update: update,
        click: click
    });

}());