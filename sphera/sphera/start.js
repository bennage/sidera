(function () {
    'use strict';

    var game = sphera.game;
    var ctx;
    var buffer, surface;

    function beginLoop() {
        var frameId = 0;

        var last, elapsed;
        var frames = 0,
            ms = 0,
            fps = 0;

        function loop(time) {
            frameId = window.requestAnimationFrame(loop);

            elapsed = time - last;
            if (elapsed < 0) elapsed = 0; // why is this here again?
            last = time;

            frames++;
            ms += elapsed;
            if (ms > 1000) {
                fps = Math.round(frames * 1000 / ms);
                ms = 0;
                frames = 0;
            }

            game.update(elapsed, time);
            game.draw(surface, elapsed, time);
            //surface.drawImage(buffer, 0, 0);

            render_fps(surface);
        }

        function render_fps(ctx) {
            ctx.fillStyle = "white";
            ctx.font = "18px sans-serif";
            ctx.fillText(fps + ' fps', 300, 20);
        }

        last = new Date().getTime();
        elapsed = 0;
        loop(last);
    }

    WinJS.Namespace.define('sphera', {
        start: function () {

            buffer = document.createElement('canvas');
            buffer.setAttribute('width', game.resolution.width);
            buffer.setAttribute('height', game.resolution.height);

            var canvas = document.querySelector('canvas#board');
            canvas.setAttribute('width', game.resolution.width);
            canvas.setAttribute('height', game.resolution.height);

            canvas.onclick = game.click;
            canvas.onmousemove = game.mouseover;
            window.onkeypress = game.onkeypress;

            surface = canvas.getContext('2d');
            ctx = buffer.getContext('2d');
            //ctx.scale(2,2);

            game.start();
            beginLoop();
        }
    });

}());