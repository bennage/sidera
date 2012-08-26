
(function () {
    'use strict';

    var Entity = sphera.entities.Entity;

    var vector = sphera.math.vector;
    var geo = sphera.math.geometry;
    var circle = geo.fullCircle;

    var Missile = WinJS.Class.derive(Entity, function (position, target) {
        Entity.prototype.constructor.call(this, 'Missile');

        this.x = position.x;
        this.y = position.y;

        this.target = target;

        this.orientation = 0;
        this.thrust = 1.5;
        this.hp = 1;
        this.shoudExplode = true;
        this.enemy = true;
        this.orient(target);

    }, {
        render: function (ctx) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,255,0,1)';
            ctx.arc(this.x, this.y, 2, 0, circle, false);
            ctx.fill();
        },
        orient: function (target) {
            var to_target = vector(target, this);
            this.orientation = to_target.angle();
        },
        update: function (elapsed, gameObjects) {
            this.x += Math.cos(this.orientation) * this.thrust;
            this.y += Math.sin(this.orientation) * this.thrust;

            if (!this.target) { return; }
            if (this.target.dead) { this.target = null; return; }

            var to_target = vector(this.target, this);
            if (to_target.distance() - this.target.radius < 0) {
                this.target.hit(20);
                this.dead = true;
            }
        }
    });

    WinJS.Namespace.define('sphera.entities', { Missile: Missile });
}());