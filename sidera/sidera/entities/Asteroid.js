(function () {
    'use strict';

    var Entity = sidera.entities.Entity;

    var Asteroid = WinJS.Class.derive(Entity, function () {
        Entity.prototype.constructor.call(this, 'Asteroid');

        this.amount = 0;
        this.sheet = Asteroid.sprite();

    }, {
        render: function (ctx) {
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
            this.scale = this.radius/100;
        }
    }, {
        sprite: function () {
            var max_height = 100;
            var max_width = 100;

            var x = max_width / 2;
            var y = max_height / 2;

            var canvas = document.createElement('canvas');
            canvas.height = max_height;
            canvas.width = max_width;

            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.fillStyle = 'brown';
            ctx.arc(x, y, 50, 0, 2 * Math.PI, false);
            ctx.fill();

            return canvas;
        }
    });

    WinJS.Namespace.define('sidera.entities', { Asteroid: Asteroid });
}());