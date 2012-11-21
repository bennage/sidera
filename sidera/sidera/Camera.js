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

        // bounds represent the area of the virtual screen being drawn
        this.bounds = {};

        // computer the initial bounds
        this.update();
    }, {

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

            var distanceToEdgeX = this.centerX * this.z;
            var distanceToEdgeY = this.centerY * this.z;

            this.bounds.left = (this.x - distanceToEdgeX);
            this.bounds.right = (this.x + distanceToEdgeX);
            this.bounds.top = (this.y - distanceToEdgeY);
            this.bounds.bottom = (this.y + distanceToEdgeY);
        }
    });

    sidera.framework.namespace.define('sidera', {
        Camera: Camera
    });
}());