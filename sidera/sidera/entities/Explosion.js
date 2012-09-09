(function () {
    'use strict';

    var Entity = sidera.entities.Entity;

    var fullCircle = sidera.math.geometry.fullCircle;

    var Explosion = WinJS.Class.derive(Entity, function (corpse) {
        Entity.prototype.constructor.call(this, 'Explosion');

        this.clouds = [];
        this.x = corpse.x;
        this.y = corpse.y;

        var count = Math.ceil(Math.random() * 5);
        for (var i = 0; i < count; i++) {
            this.clouds.push({
                x: (Math.random() * 20) - 10,
                y: (Math.random() * 20) - 10,
                r: (Math.random() * 20) + 5,
                start: i * (300 / count), // start time offset
                life: 300 * Math.random() + 200
            });
        }

    }, {
        render: function (ctx, scale) {
            var count = this.clouds.length;
            var puff;
            for (var i = 0; i < count; i++) {
                puff = this.clouds[i];
                if (puff.start > 0) { continue; }

                ctx.beginPath();
                ctx.fillStyle = 'rgba(255,255,0,' + puff.life / 1000 + ')';
                ctx.arc(puff.x * scale, puff.y * scale, puff.r * scale, 0, fullCircle, false);
                ctx.fill();
            }
        },
        update: function (elapsed) {
            var count = this.clouds.length;
            var puff;
            var alive = false;

            for (var i = 0; i < count; i++) {
                puff = this.clouds[i];
                puff.start -= elapsed;
                if (puff.start <= 0) {
                    puff.life -= elapsed;
                }
                if (puff.life >= 0) {
                    alive = true;
                }
            }

            if (!alive) {
                this.dead = true;
            }
        }
    });

    WinJS.Namespace.define('sidera.entities', { Explosion: Explosion });
}());