(function () {
    'use strict';

    var vector = space.vector;
    var geo = space.geometry;

    var max_speed = 20;
    var max_angle = Math.PI / 100;
    var range = 200;
    var rechargeRate = 1 * 1000; /* ms */

    var Fighter = WinJS.Class.derive(space.Entity, function () {

        this.setup('Fighter');
        this.enemy = true;
        this.orientation = 0;
        this.velocity = vector(0, 0);
        this.thrust = 0;
        this.laser = 0;

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

            if (this.laser > 0 && this.target) {
                ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(this.target.x, this.target.y);
                ctx.stroke();
            }
        },

        update: function (elapsed, entities) {

            this.target = acquireTarget(this, entities);

            if (this.target) {
                var to_target = vector(this.target, this);

                if (this.laser > 0) {
                    this.laser = this.laser - 1;
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

                if (to_target.distance() > 50 && this.orientation !== to_target.angle()) {
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
                            this.laser = 5;
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

    function acquireTarget(self, entities) {
        var candidates = entities.filter(function (entity) {
            return (entity !== self) && !entity.enemy && entity.hp;
        });

        if (candidates.length === 0) return null;

        var current_distance = vector(self, candidates[0]);

        return candidates.reduce(function (current, next) {
            var next_distance = vector(self, next);

            return (next_distance.distance() >= current_distance.distance())
                ? current
                : next;
        });
    }

    WinJS.Namespace.define('space', { Fighter: Fighter });
}());