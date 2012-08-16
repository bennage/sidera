(function () {
    'use strict';

    var game = sphera.game;
    var ctx;
    var buffer, surface;

    function beginLoop() {
        var frameId = 0;
        var start = window.animationStartTime;

        function loop(timestamp) {

            var elapsed = timestamp - start;

            frameId = window.requestAnimationFrame(loop);

            game.update(elapsed, timestamp);
            game.draw(surface, elapsed, timestamp);
            //surface.drawImage(buffer, 0, 0);

            start = window.animationStartTime;
        }

        loop(0);
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