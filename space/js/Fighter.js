(function () {
    'use strict';

    var vector = space.vector;
    var geo = space.geometry;

    var max_speed = 20;
    var max_angle = Math.PI / 100;
    var range = 200;
    var rechargeRate = 1 * 1000; // ms
    var laser_cooldown = 500; // ms

    var Fighter = WinJS.Class.derive(space.Entity, function () {

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
        },

        update: function (elapsed, entities) {

            if (this.work) {
                this.target = acquireTarget(this, entities);
            }

            this.work = !this.work;

            if (this.target) {
                var to_target = vector(this.target, this);

                if (this.cooldown > 0) {
                    this.cooldown -= elapsed;
                }

                if (this.untilRecharge > 0) {
                    this.untilRecharge -= elapsed;
                }

                this.orientation = this.orientation % (2 * Math.PI);

                if (to_target.distance() < 70) {
                    if (!this.focus) {
                        this.focus = {
                            x: this.target.x + 100,
                            y: this.target.y + 100
                        };
                    }

                    var target_angle = vector(this.focus, this).angle();

                    var delta = this.orientation - target_angle;
                    if (Math.abs(delta) > Math.PI) {
                        delta = (-2 * Math.PI) + Math.abs(delta);
                    }
                    var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
                    var adjust = Math.min(max_angle, Math.abs(delta));
                    this.orientation -= (sign * adjust);
                }

                if (to_target.distance() > 70 && this.orientation !== to_target.angle()) {
                    this.focus = null;
                    var delta = this.orientation - to_target.angle();
                    if (Math.abs(delta) > Math.PI) {
                        delta = (-2 * Math.PI) + Math.abs(delta);
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
            this.x += Math.cos(this.orientation);
            this.y += Math.sin(this.orientation);
        }

    });

    function length_squared(v, w) {
        return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    }

    function acquireTarget(self, entities) {
        var entity,
            current_distance,
            closest,
            last_distance = Number.POSITIVE_INFINITY;

        for (var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];
            if ((entity !== self) && !entity.enemy && entity.hp) {

                current_distance = length_squared(self, entity);

                if (current_distance < last_distance) {
                    last_distance = current_distance;
                    closest = entity;
                }
            }
        }

        return closest;
    }

    WinJS.Namespace.define('space', { Fighter: Fighter });
}());