(function() {

    'use strict';

    var hue = 0;
    var direction = 1;
    var transitioning = false;

    function start() {
        transitioning = false;
    }

    function centerText(ctx, text, y) {
        var measurement = ctx.measureText(text);
        var x = (ctx.canvas.width - measurement.width) / 2;
        ctx.fillText(text, x, y);
    }

    function draw(ctx, elapsed) {
        var y = ctx.canvas.height / 2;
        var color = 'rgb(' + hue + ',0,0)';
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '48px monospace';
        centerText(ctx, 'sidera', y);

        ctx.fillStyle = color;
        ctx.font = '24px monospace';
        centerText(ctx, 'tap to begin', y + 30);
    }

    function update() {
        hue += 1 * direction;
        if(hue > 255) direction = -1;
        if(hue < 1) direction = 1;

        var mouse = sidera.mouse.getState();
        var anyKeyPressed = sidera.keyboard.isAnyKeyPressed();
        if((mouse.buttonPressed || anyKeyPressed) && !transitioning) {
            transitioning = true;
            this.transition(sidera.game, {
                level: 1
            });
        }
    }

    sidera.framework.namespace.define('sidera.start.screen', {
        start: start,
        draw: draw,
        update: update
    });

}());