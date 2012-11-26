(function() {
    'use strict';

    var canvas, // the visible canvas element    
    surface, // the 2d context of `canvas`
    currentScreen; // the currently rendered screen for the game
    // var resolution = { height: window.innerHeight, width: window.innerWidth };
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

    sidera.framework.namespace.define('sidera', {
        bootstrap: function() {

            sidera.resolution = resolution;

            canvas = document.querySelector('canvas#board');
            canvas.setAttribute('width', resolution.width);
            canvas.setAttribute('height', resolution.height);

            surface = canvas.getContext('2d');

            sidera.keyboard.listen(window);
            sidera.mouse.listen(canvas);

            sidera.assets.files = ['rocks.png', 'fighter.png', 'miner.png'];
            sidera.assets.load(function() {

                transition(sidera.start.screen);
                currentScreen = sidera.start.screen;
                beginLoop();

            }, function() {
                debugger;
            }, function(percent) {
                console.log('loaded ' + (percent * 100) + '%');
            });
        }
    });

}());