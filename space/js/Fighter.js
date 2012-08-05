(function () {
    'use strict';

    var vector = space.vector;
    var geo = space.geometry;
    var max_speed = 20;
    var max_angle = Math.PI / 100;
    var range = 200;
    var rechargeRate = 5 * 1000; /* ms */

    var Fighter = WinJS.Class.derive(space.Entity, function () {

        this.setup('Fighter');

        this.orientation = 0;
        this.velocity = vector(0, 0);
        this.thrust = 0;

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
        },

        update: function (elapsed, entities) {

            this.target = acquireTarget(this, entities);

            if (!this.target) return;

            var to_target = vector(this.target, this);

            if (this.untilRecharge > 0) {
                this.untilRecharge -= elapsed;
            } else if (this.target) {
                if (to_target.distance() <= range) {
                    //attack target
                    this.untilRechage = rechargeRate;
                }
            }
            if (this.orientation !== to_target.angle()) {
                this.orientation = to_target.angle();
                console.log(this.orientation * (180 / Math.PI));
                console.log(to_target.x + ',' + to_target.y);
            }
            //var orientation_delta = this.orientation - to_target.angle();
            //var sign = (orientation_delta < 0) ? 1 : -1;
            //this.orientation += (sign * max_angle);
            //this.orientation %= (Math.PI * 2)
            //console.log(orientation_delta);

            // accel towards target
        }

    });

    function acquireTarget(self, entities) {
        var candidates = entities.filter(function (entity) {
            return (entity !== self) && entity.type === 'Miner';
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