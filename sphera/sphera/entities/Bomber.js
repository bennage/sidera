(function () {
    'use strict';

    var Fighter = sphera.entities.Fighter;
    var Missile = sphera.entities.Missile;

    var vector = sphera.math.vector;
    var geo = sphera.math.geometry;
    var circle = geo.fullCircle;

    var max_angle = Math.PI / 300;
    var range = 350;
    var reloadRate = 1 * 4000; // ms

    var choice = 1;

    var Bomber = WinJS.Class.derive(Fighter, function () {
        Fighter.prototype.constructor.call(this, 'Bomber');

        this.thrust = 0.3;
        this.untilRecharge = reloadRate * Math.random() + 1000;

    }, {
        render: function (ctx, ghost) {
            var self = this;
            var x = self.x;
            var y = self.y;

            ctx.fillStyle = 'darkred';
            ctx.strokeStyle = 'darkred';

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.orientation);

            ctx.beginPath();
            ctx.moveTo(-20, -6);
            ctx.lineTo(20, -10);
            ctx.bezierCurveTo(6, 4, 6, -4, 20, 10);
            ctx.lineTo(-20, 6);
            ctx.bezierCurveTo(-7, 0, -7, 0, -20, -6);
            ctx.fill();

            ctx.restore();
        },

        update: function (elapsed, gameObjects) {

            // let's only peform the acquisition every other time
            this.work = !this.work;

            if (this.work) {
                this.target = acquireTarget(this, gameObjects);
            }

            // update position every time
            this.x += Math.cos(this.orientation) * this.thrust;
            this.y += Math.sin(this.orientation) * this.thrust;

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
                        this.untilRecharge = reloadRate;
                        this.fire(this.target, entities);
                    }
                }
            }
        },

        fire: function (target, entities) {
            var missile = new Missile(this, target);
            entities.push(missile);
        }
    });

    function acquireTarget(self, gameObjects) {
        var entity,
            current_distance,
            closest,
            last_distance = Number.POSITIVE_INFINITY;

        var entities = gameObjects.friendlies;

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

    WinJS.Namespace.define('sphera.entities', { Bomber: Bomber });
}());