(function() {
    'use strict';

    var Entity = sidera.framework.class.define(function(type) {
        this.type = type;
        this.scale = 1;
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.shoudExplode = false;

        sidera.keyboard.mixinKeyCheck(this);

    }, {

        // Copy the members to this
        hydrate: function(members) {
            for(var p in members) {
                if(members.hasOwnProperty(p)) {
                    this[p] = members[p];
                }
            }
        },

        hit: function(damage) {
            if(!this.hp) return;
            this.hp -= damage;
            if(this.hp <= 0) {
                this.dead = true;
            }
        },

        // default render function
        render: function(ctx) {
            ctx.fillStyle = "white";
            ctx.font = "10px sans-serif";
            ctx.fillText(this.type, this.x, this.y);
        },

        renderMeter: function(ctx, percent, color, offset, scale) {
            var height = 12 * scale;
            var width = 4 * scale;
            var amount = percent * height;
            var x = offset.x * scale;
            var y = offset.y * scale;

            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.strokeRect(x, y, width, height);
            ctx.fillRect(x, y + height - amount, width, amount);
        },

        canPlace: function(entities) {
            var self = this;
            return !entities.some(function(entity) {
                var d = Math.sqrt(Math.pow(self.x - entity.x, 2) + Math.pow(self.y - entity.y, 2));
                return d < (self.radius + entity.radius);
            });
        }
    });

    sidera.framework.namespace.define('sidera.entities', {
        Entity: Entity
    });
}());