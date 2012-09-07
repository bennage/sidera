(function () {
    'use strict';

    var Entity = WinJS.Class.define(function (type) {
        this.type = type;
        this.scale = 1;
        this.x = 100;
        this.y = 100;
        this.radius = 0;
        this.shoudExplode = false;
    }, {

        // Copy the members to this
        hydrate: function (members) {
            for (var p in members) {
                if (members.hasOwnProperty(p)) {
                    this[p] = members[p];
                }
            }
        },

        hit: function (damage) {
            if (!this.hp) return;
            this.hp -= damage;
            if (this.hp <= 0) {
                this.dead = true;
            }
        },

        // default render function
        render: function (ctx) {
            ctx.fillStyle = "white";
            ctx.font = "10px sans-serif";
            ctx.fillText(this.type, this.x, this.y);
        },

        renderMeter: function (ctx, percent, color, offset) {
            var height = 12;
            var width = 4;
            var amount = percent * height;
            var x = this.x + offset.x;
            var y = this.y - offset.y;

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.strokeRect(x, y, width, height);
            ctx.fillRect(x, y + height - amount, width, amount);
        },

        canPlace: function (entities) {
            var self = this;
            return !entities.some(function (entity) {
                var d = Math.sqrt(Math.pow(self.x - entity.x, 2) + Math.pow(self.y - entity.y, 2));
                return d < (self.radius + entity.radius);
            });
        }
    });

    WinJS.Namespace.define('sidera.entities', { Entity: Entity });
}());