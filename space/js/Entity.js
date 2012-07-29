(function () {
    'use strict';

    var Entity = WinJS.Class.define(function () { }, {
        setup: function (type) {
            this.type = type;
            this.x = 100;
            this.y = 100;
            this.radius = 0;
        },

        hydrate: function (options) {
            for (var p in options) {
                if (options.hasOwnProperty(p)) {
                    this[p] = options[p];
                }
            }
        },

        destroy: function () { },

        render: function (ctx) {
            ctx.fillStyle = "white";
            ctx.font = "10px sans-serif";
            ctx.fillText(this.type, this.x, this.y);
        },

        canPlace: function (entities) {
            var self = this;
            return !entities.some(function (entity) {
                var d = Math.sqrt(Math.pow(self.x - entity.x, 2) + Math.pow(self.y - entity.y, 2));
                return d < (self.radius + entity.radius);
            });
        }
    });

    WinJS.Namespace.define('space', { Entity: Entity });
}());