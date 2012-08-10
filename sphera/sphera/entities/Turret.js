(function () {
    'use strict';

    var vector = sphera.math.vector;
    var geo = sphera.math.geometry;

    var range = 200;
    var laser_charge = 5;
    var laser_cooldown = 1 * 1000; // ms

    var max_battery = 25;
    var max_health = 20;
    var max_angle = Math.PI / 30;

    var Turret = WinJS.Class.derive(sphera.entities.Entity, function () {
        this.setup('Turret');

        this.cooldown = 0;
        this.battery = 0;

        this.powered = true;
        this.hp = max_health;
        this.shoudExplode = true;

        this.orientation = (Math.PI * 2) * Math.random(); // start with the turrent pointing a random direction

        this.radius = 5;
    }, {
        render: function (ctx, ghost) {
            var self = this;

            ctx.beginPath();
            ctx.fillStyle = ghost ? 'rgba(0,255,0,0.2)' : 'green';
            ctx.arc(self.x, self.y, 10, 0, 2 * Math.PI, false);
            ctx.fill();

            // battery meter
            this.renderMeter(ctx, (this.battery / max_battery), 'yellow', { x: 12, y: 10 });

            // health meter
            this.renderMeter(ctx, (this.hp / max_health), 'green', { x: -16, y: 10 });

            // cannon
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(0,64,0,1)';

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.orientation);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 0);
            ctx.stroke();

            ctx.restore();

            if (this.cooldown > 0 && this.target) {
                var fade = this.cooldown / laser_cooldown;
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,0,255,' + fade + ')';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.target.x, this.target.y);
                ctx.stroke();
            }
        },
        update: function (elapsed, entities) {

            if (this.cooldown > 0) {
                this.cooldown -= elapsed;
            }

            if (this.cooldown > 0 || this.battery < laser_charge) return;

            this.target = acquireTarget(this, entities);

            if (!this.target) return;

            var to_target = vector(this.target, this);

            // track the target
            var delta = this.orientation - to_target.angle();
            if (Math.abs(delta) > Math.PI) {
                delta = (-2 * Math.PI) + Math.abs(delta);
            }
            var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
            var adjust = Math.min(max_angle, Math.abs(delta));
            this.orientation -= (sign * adjust);

            this.orientation = this.orientation % (2 * Math.PI);

            if (to_target.distance() <= range && Math.abs(delta) <= max_angle) {
                this.cooldown = laser_cooldown;
                this.battery -= laser_charge;
                this.target.hit(1);
            }
        },
        charge: function (available) {
            var capacity = max_battery - this.battery;
            var used = Math.min(available, capacity);
            this.battery += used;
            return used;
        }
    }, {
        cost: 20,
    });

    function acquireTarget(self, entities) {
        var entity,
            current_distance,
            closest,
            last_distance = Number.POSITIVE_INFINITY;

        for (var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];
            if (entity.enemy) {

                current_distance = geo.lengthSquared(self, entity);

                if (current_distance < last_distance) {
                    last_distance = current_distance;
                    closest = entity;
                }
            }
        }

        return closest;
    }

    WinJS.Namespace.define('sphera.entities', { Turret: Turret });
}());