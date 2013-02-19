define(function(require) {

    var resolution = require('resolution'),
        assets = require('assets'),
        keyboard = require('input/keyboard'),
        startScreen = require('start/screen');

    var touch = require('input/provider');

    var canvas, // the visible canvas element    
        surface, // the 2d context of `canvas`
        currentScreen; // the currently rendered screen for the game

    function beginLoop() {
        var frameId = 0;
        var lastFrame = Date.now();
        var thisFrame = Date.now();
        var elapsed = 0;

        function loop() {
            thisFrame = Date.now();

            elapsed = thisFrame - lastFrame;

            frameId = window.requestAnimationFrame(loop);

            currentScreen.update(elapsed);
            currentScreen.draw(surface, elapsed);

            lastFrame = thisFrame;
        }

        loop();
    }

    function transition(screen, options) {

        currentScreen = screen;

        if(currentScreen.start) currentScreen.start(options);
        currentScreen.transition = transition;
    }

    return function() {

        canvas = document.querySelector('canvas#board');
        canvas.setAttribute('width', resolution.width);
        canvas.setAttribute('height', resolution.height);

        surface = canvas.getContext('2d');

        keyboard.listen(window);
        touch.listen(canvas);

        assets.files = ['rocks.png', 'fighter.png', 'miner.png','turret.png'];
        assets.load(function() {

            transition(startScreen);
            currentScreen = startScreen;
            beginLoop();

        }, function() {
            debugger;
        }, function(percent) {
            console.log('loaded ' + (percent * 100) + '%');
        });
    };

});