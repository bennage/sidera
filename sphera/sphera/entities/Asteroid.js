(function () {
    'use strict';

    var Entity = sphera.entities.Entity;

    var Asteroid = WinJS.Class.derive(Entity, function () {
        Entity.prototype.constructor.call(this, 'Asteroid');

        this.amount = 0;

    }, {
        render: function (ctx) {
            ctx.beginPath();
            ctx.fillStyle = 'brown';
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fill();
        },
        mine: function (amount, success) {
            if (this.amount > 0) {
                var took = Math.min(this.amount, amount);
                this.amount -= took;
                if (success) { success(took); }
            }

            if (this.amount <= 0) {
                this.dead = true;
                this.amount = 0;
            }
        },
        update: function () {
            this.radius = Math.sqrt(this.amount / Math.PI);
        }
    });

    WinJS.Namespace.define('sphera.entities', { Asteroid: Asteroid });
}());