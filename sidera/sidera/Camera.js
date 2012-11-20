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

        this.update();
    }, {
        scale: function() {
            return this.z;
        },
        project: function(coords) {
            var _x = coords.x + this.x;
            var _y = coords.y + this.y;
            var scale = this.scale();

            _x = ((_x - this.centerX) * scale) + this.centerX;
            _y = ((_y - this.centerY) * scale) + this.centerY;

            return {
                x: _x,
                y: _y
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