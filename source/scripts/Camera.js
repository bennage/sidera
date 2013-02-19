define(function(require) {

    var MapGrid = require('entities/MapGrid'),
        resolution = require('resolution'),
        keyboard = require('input/keyboard'),
        vector = require('math/vector'),
        tween = require('animation/tween');

    var Camera = function() {

            var map = MapGrid;
            var aspectRatio = resolution.width / resolution.height;

            this.screen = resolution;

            // x,y start off in the middle of the screen
            this.centerX = Math.round(this.screen.width / 2);
            this.centerY = Math.round(this.screen.height / 2);

            this.x = Math.round(map.columns / 2);
            this.y = Math.round(map.rows / 2);

            this.viewport = {
                width: map.columns * map.cellSize,
                height: map.rows * map.cellSize,
                aspectRatio: aspectRatio
            };

            this.updateViewPort();

            keyboard.mixinKeyCheck(this);

        };

    //todo: movement is hard coded, indepedent of camera project, it doesn't respect the 2:1 either
    Camera.prototype.commands = {
        87: function() {
            //w
            this.y -= Camera.speed;
            this.x -= Camera.speed;
        },
        83: function() {
            //s
            this.y += Camera.speed;
            this.x += Camera.speed;
        },
        65: function() {
            //a
            this.y += Camera.speed;
            this.x -= Camera.speed;
        },
        68: function() {
            //d
            this.y -= Camera.speed;
            this.x += Camera.speed;
        },
        90: function() {
            //z
            this.viewport.height /= Camera.zoomSpeed;
        },
        67: function() {
            //c
            this.viewport.height *= Camera.zoomSpeed;
        }
    };

    Camera.prototype.updateViewPort = function() {
        // assume that the width needs to be adjusted
        this.viewport.width = this.viewport.height * this.viewport.aspectRatio;
    };

    Camera.prototype.project = function(objectToRender) {
        var scale = this.scale;
        var camera = this;

        // dimetric projection results is 2:1
        var w = MapGrid.cellSize;
        var h = MapGrid.cellSize >> 1;

        var _x = objectToRender.x - camera.x;
        var _y = objectToRender.y - camera.y;

        var _x1 = (_x * w - _y * w) * scale + camera.centerX;
        var _y1 = (_x * h + _y * h) * scale + camera.centerY;

        return {
            x: _x1,
            y: _y1
        };
    };

    Camera.prototype.toWorldSpace = function(screenCoords) {
        // dimetric projection results is 2:1
        var w = MapGrid.cellSize << 1;
        var h = MapGrid.cellSize;
        var demoninator = w * h;

        var scale = this.scale;
        var camera = this;

        var _x = (screenCoords.x - camera.centerX) / scale;
        var _y = (screenCoords.y - camera.centerY) / scale;

        var _x1 = (w * _y + h * _x) / demoninator;
        var _y1 = (w * _y - h * _x) / demoninator;

        _x1 += camera.x;
        _y1 += camera.y;

        return {
            x: _x1,
            y: _y1
        };
    };

    Camera.prototype.update = function(elapsed) {
        this.updateViewPort();
        this.scale = this.screen.height / this.viewport.height;
        this.checkCommands();

        // keep the zoom level to reasonable constraints
        this.viewport.height = Math.min(this.viewport.height, Camera.max);
        this.viewport.height = Math.max(this.viewport.height, Camera.min);

        // has the camera been asked to animate to a location
        if(this.animation) {
            this.x = this.animation.x(elapsed);
            this.y = this.animation.y(elapsed);
            this.viewport.height = this.animation.viewport.height(elapsed);

            if(this.animation.x.finished) {
                this.animation = null;
            }
        }
    };

    Camera.prototype.animateTo = function(target) {
        var duration = 1000;
        this.animation = {
            x: tween(this.x, target.x, duration, tween.smooth),
            y: tween(this.y, target.y, duration, tween.smooth),
            viewport: {
                height: tween(this.viewport.height, target.viewport.height, duration, tween.smooth)
            }
        };
    };

    Camera.speed = 0.1;
    Camera.zoomSpeed = 0.95;
    Camera.min = 140;
    Camera.max = 900;

    return Camera;
});