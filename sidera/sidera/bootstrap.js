(function() {
    'use strict';

    var canvas, // the visible canvas element
    surface, // the 2d context of `canvas`
    currentScreen; // the currently rendered screen for the game

    //var resolution = { height: window.innerHeight, width: window.innerWidth };
    var resolution = {
        height: 600,
        width: 800
    };

    function beginLoop() {
        var frameId = 0;
        var lastFrame = Date.now();

        function loop() {
            var thisFrame = Date.now();

            var elapsed = thisFrame - lastFrame;

            frameId = window.requestAnimationFrame(loop);

            currentScreen.update(elapsed, thisFrame);
            currentScreen.draw(surface, elapsed, thisFrame);

            lastFrame = thisFrame;
        }

        loop();
    }

    function transition(screen, options) {

        currentScreen = screen;

        if(currentScreen.start) currentScreen.start(options);
        currentScreen.transition = transition;
    }

    function handle_mouseclick(args) {
        if(!currentScreen || !currentScreen.click) return;
        currentScreen.click(args);
    }

    function handle_mousemove(args) {
        if(!currentScreen || !currentScreen.mouseover) return;
        currentScreen.mouseover(args);
    }

    function handle_keypress(args) {
        if(!currentScreen || !currentScreen.onkeypress) return;
        currentScreen.onkeypress(args);
    }

    sidera.framework.namespace.define('sidera', {
        bootstrap: function() {

            sidera.resolution = resolution;

            canvas = document.querySelector('canvas#board');
            canvas.setAttribute('width', resolution.width);
            canvas.setAttribute('height', resolution.height);

            surface = canvas.getContext('2d');

            canvas.addEventListener("click", handle_mouseclick);
            canvas.addEventListener("mousemove", handle_mousemove);
            window.addEventListener("keypress", handle_keypress);

            transition(sidera.start.screen);
            currentScreen = sidera.start.screen;

            beginLoop();
        }
    });

}());