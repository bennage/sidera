(function () {
    'use strict';

    var Asteroid = WinJS.Class.derive(sphera.entities.Entity, function () {
        this.amount = 0;
        this.setup('Asteroid');
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
                this.destroy();
                this.amount = 0;
            }
        },
        update: function () {
            this.radius = Math.sqrt(this.amount / Math.PI);
        }
    });

    WinJS.Namespace.define('sphera.entities', { Asteroid: Asteroid });
}());