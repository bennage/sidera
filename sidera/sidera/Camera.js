(function() {
    'use strict';

    var Camera = sidera.framework.class.define(function(resolution) {

        this.resolution = resolution;

        // todo: can we remove these values? 
        this.centerX = Math.round(resolution.width / 2);
        this.centerY = Math.round(resolution.height / 2);

        // x,y start off in the middle of the screen's area
        this.x = Math.round(resolution.width / 2);
        this.y = Math.round(resolution.height / 2);
        
        // assume a magnification of 1
        this.z = 1;

        sidera.keyboard.mixinKeyCheck(this);

    }, {

        commands: {
            87: function() {
                //w
                this.y -= Camera.speed;
            },
            83: function() {
                //s
                this.y += Camera.speed;
            },
            65: function() {
                //a
                this.x -= Camera.speed;
            },
            68: function() {
                //d
                this.x += Camera.speed;
            },
            90: function() {
                //z
                this.z -= Camera.zoomSpeed;
                this.z = Math.max(this.z, Camera.minZoom);
            },
            67: function() {
                //c
                this.z += Camera.zoomSpeed;
                this.z = Math.min(this.z, Camera.maxZoom);
            }
        },

        scale: function() {
            return this.z;
        },

        project: function(coords) {
            var cellSize = sidera.entities.MapGrid.cellSize;

            var _x = (coords.x * cellSize);
            var _y = (coords.y * cellSize);

            var dX = (_x - this.x) * this.z;
            var dY = (_y - this.y) * this.z;

            var pX = this.x + dX;
            var pY = this.y + dY;

            return {
                x: pX,
                y: pY
            };
        },

        update: function() {
            this.checkCommands();
        }
    }, {
        speed: 5,
        zoomSpeed: 0.1,
        minZoom: 0.5,
        maxZoom: 4
    });

    sidera.framework.namespace.define('sidera', {
        Camera: Camera
    });
}());