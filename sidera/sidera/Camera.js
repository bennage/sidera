(function () {
    'use strict';

    var Camera = sidera.framework.class.define(function (resolution) {
        this.centerX = Math.round(resolution.width / 2);
        this.centerY = Math.round(resolution.height / 2);
    },
    {
        x: 0,
        y: 0,
        z: 1,
        scale: function () {
            return this.z;
        },
        project: function (coords) {
            var _x = coords.x + this.x;
            var _y = coords.y + this.y;
            var scale = this.scale();

            _x = ((_x - this.centerX) * scale) + this.centerX;
            _y = ((_y - this.centerY) * scale) + this.centerY;

            return {
                x: _x,
                y: _y
            };
        }
    });


    sidera.framework.namespace.define('sidera',
        {
            Camera: Camera
        });
}());