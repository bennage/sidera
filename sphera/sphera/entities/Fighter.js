(function () {
    'use strict';

    var vector = sphera.math.vector;
    var geo = sphera.math.geometry;
    var circle = geo.fullCircle;

    var max_speed = 20;
    var max_angle = Math.PI / 100;
    var range = 200;
    var rechargeRate = 1 * 1000; // ms
    var laser_cooldown = 500; // ms

    var choice = 1;

    var Fighter = WinJS.Class.derive(sphera.entities.Entity, function () {

        this.setup('Fighter');
        this.enemy = true;
        this.orientation = 0;
        this.velocity = vector(0, 0);
        this.thrust = 0;
        this.laser = 0;
        this.hp = 5;

        this.cooldown = 0;
        this.untilRecharge = rechargeRate;

        this.target = null;
    }, {
        render: function (ctx, ghost) {
            var self = this;
            var x = self.x;
            var y = self.y;

            ctx.fillStyle = 'blue';

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.orientation);

            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-10, -5);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-10, 5);
            ctx.lineTo(10, 0);
            ctx.fill();

            ctx.restore();

            if (this.cooldown > 0 && this.target) {
                var fade = this.cooldown / laser_cooldown;
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,255,0,' + fade + ')';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(this.target.x, this.target.y);
                ctx.stroke();
            }

            if (this.focus) {
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255,0,0,0.2)';
                ctx.arc(this.focus.x, this.focus.y, 2, 0, circle, false);
                ctx.fill();
            }
        },

        update: function (elapsed, entities) {

            // let's only peform the acquisition every other time
            this.work = !this.work;

            if (this.work) {
                this.target = acquireTarget(this, entities);
            }

            // update position every time
            this.x += Math.cos(this.orientation);
            this.y += Math.sin(this.orientation);

            if (this.cooldown > 0) {
                this.cooldown -= elapsed;
            }

            if (this.untilRecharge > 0) {
                this.untilRecharge -= elapsed;
            }

            if (this.orientation > circle) {
                this.orientation = this.orientation % circle;
            }

            if (!this.target) { return; }

            var to_target = vector(this.target, this);

            // we're too close, turn away
            if (to_target.distance() < 70) {

                // where should we turn to?
                if (!this.focus) {

                    var current_angle = to_target.angle();
                    var new_angle = current_angle + (circle / 4 * choice); // or minus
                    var some_distance = 120;
                    choice *= -1;

                    this.focus = {
                        x: this.target.x + (some_distance * Math.cos(new_angle)),
                        y: this.target.y + (some_distance * Math.sin(new_angle))
                    };
                }

                var target_angle = vector(this.focus, this).angle();

                var delta = this.orientation - target_angle;
                if (Math.abs(delta) > Math.PI) {
                    delta = (-circle) + Math.abs(delta);
                }
                var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
                var adjust = Math.min(max_angle, Math.abs(delta));
                this.orientation -= (sign * adjust);
            }

            if ((to_target.distance() > 120 && this.focus) || !this.focus) {
                this.focus = null;
                var delta = this.orientation - to_target.angle();
                if (Math.abs(delta) > Math.PI) {
                    delta = (-circle) + Math.abs(delta);
                }
                var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
                var adjust = Math.min(max_angle, Math.abs(delta));
                this.orientation -= (sign * adjust);

                // fire laser
                if (this.untilRecharge <= 0 && this.target) {
                    if (to_target.distance() <= range && (Math.abs(delta) < (Math.PI / 180))) {
                        //attack target
                        this.cooldown = laser_cooldown;
                        this.untilRecharge = rechargeRate;
                        this.target.hit(1);
                    }
                }
            }
        }

    });

    function acquireTarget(self, entities) {
        var entity,
            current_distance,
            closest,
            last_distance = Number.POSITIVE_INFINITY;

        for (var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];
            if ((entity !== self) && !entity.enemy && entity.hp) {

                current_distance = geo.lengthSquared(self, entity);

                if (current_distance < last_distance) {
                    last_distance = current_distance;
                    closest = entity;
                }
            }
        }

        return closest;
    }

    WinJS.Namespace.define('sphera.entities', { Fighter: Fighter });
}());