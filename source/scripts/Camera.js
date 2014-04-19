define(function (require) {

    var MapGrid = require('entities/MapGrid'),
        resolution = require('resolution'),
        keyboard = require('input/keyboard'),
        input = require('input/provider'),
        vector = require('math/vector'),
        tween = require('animation/tween');

    var Camera = function () {

        var map = MapGrid;
        var aspectRatio = resolution.aspectRatio;

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

    Camera.prototype.commands = {
        87 /* w */: function () {
            this.y -= Camera.speed;
        },
        83 /* s */: function () {
            this.y += Camera.speed;
        },
        65 /* a */: function () {
            this.x -= Camera.speed;
        },
        68 /* d */: function () {
            this.x += Camera.speed;
        },
        90 /* z */: function () {
            this.viewport.height /= Camera.zoomSpeed;
            this.updateViewPort();
        },
        67 /* c */: function () {
            this.viewport.height *= Camera.zoomSpeed;
            this.updateViewPort();
        }
    };

    Camera.prototype.updateViewPort = function () {
        // assume that the width needs to be adjusted
        this.viewport.width = this.viewport.height * this.viewport.aspectRatio;

        // adjust the scale
        this.scale = this.screen.height / this.viewport.height;
        this.scaledCellSize = this.scale * MapGrid.cellSize;
    };

    Camera.prototype.project = function (objectToRender) {
        var camera = this;

        var _x = objectToRender.x - camera.x;
        var _y = objectToRender.y - camera.y;

        var _x1 = (_x * this.scaledCellSize) + this.centerX;
        var _y1 = (_y * this.scaledCellSize) + this.centerY;

        return {
            x: _x1,
            y: _y1
        };
    };

    Camera.prototype.toWorldSpace = function (screenCoords) {

        var worldX = ((screenCoords.x / resolution.aspectRatio) - this.centerX) / this.scaledCellSize;
        var worldY = ((screenCoords.y / resolution.aspectRatio) - this.centerY) / this.scaledCellSize;

        var x1 = worldX + this.x;
        var y1 = worldY + this.y;

        return {
            x: x1,
            y: y1
        };
    };

    Camera.prototype.update = function (elapsed) {

        this.checkCommands();

        // keep the zoom level to reasonable constraints
        this.viewport.height = Math.min(this.viewport.height, Camera.max);
        this.viewport.height = Math.max(this.viewport.height, Camera.min);

        // has the camera been asked to animate to a location
        if (this.animation) {
            this.x = this.animation.x(elapsed);
            this.y = this.animation.y(elapsed);
            this.viewport.height = this.animation.viewport.height(elapsed);

            if (this.animation.x.finished) {
                this.animation = null;
            }

            this.updateViewPort();
        }

        // single touch to drag map
        if (!input.state.handled && input.state.hasPointer && input.state.pointers.length === 1) {

            if (this.lastPoint) {

                var scale = 1 / this.scaledCellSize;
                var delta = vector(input.state, this.lastPoint).multiply(scale);

                this.x -= delta.x;
                this.y -= delta.y;

                input.state.handled = true;
            }

            this.lastPoint = {
                x: input.state.x,
                y: input.state.y
            };

        } else {
            this.lastPoint = null;
        }

        // multi-touch to zoom
        if (!input.state.handled && input.state.pointers.length === 2) {
            //todo: pinch/pull
        }
    };

    Camera.prototype.animateTo = function (target) {
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