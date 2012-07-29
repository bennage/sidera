(function () {
    'use strict';

    var game = space.game;
    var ctx;

    function beginLoop() {
        var frameId = 0;

        var last, elapsed;

        function loop(time) {
            frameId = window.requestAnimationFrame(loop);

            game.update(elapsed, time);
            game.draw(ctx, elapsed, time);

            elapsed = time - last;
            last = time;
        }

        last = new Date().getTime();
        elapsed = 0;
        loop(last);
    }

    WinJS.Namespace.define('space', {
        start: function () {
            var canvas = document.querySelector('canvas#board');
            canvas.setAttribute('width', game.resolution.width);
            canvas.setAttribute('height', game.resolution.height);

            canvas.onclick = game.click;
            canvas.onmousemove = game.mouseover;
            window.onkeypress = game.onkeypress;

            ctx = canvas.getContext('2d');
            //ctx.scale(2,2);

            game.start();
            beginLoop();
        }
    });

}());