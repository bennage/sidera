(function() {
    'use strict';

    var Entity = sidera.entities.Entity;

    var Asteroid = sidera.framework.class.derive(Entity, function() {
        Entity.prototype.constructor.call(this, 'Asteroid');

        this.amount = 0;
        this.frame = Math.random() * 60;
        this.sprites = sidera.assets['rocks.png'];

    }, {
        render: function(ctx, camera) {

            this.frame += 0.1;
            if(this.frame > 60) this.frame %= 60;

            var frame = Math.floor(this.frame);
            var x0 = (frame % 8) * 128;
            var y0 = Math.floor(frame / 8) * 128;;
            var x1 = 128;
            var y1 = 128;
            var size = 128 * this.scale * camera.scale();

            var coords = camera.project(this);
            ctx.save();
            ctx.translate(coords.x, coords.y);
            ctx.drawImage(this.sprites, x0, y0, x1, y1, -size / 2, -size / 2, size, size);
            ctx.fillStyle = "white";
            ctx.font = "8px sans-serif";
            ctx.fillText(this.x + ',' + this.y, this.x, this.y);
            ctx.restore();
        },

        mine: function(amount, success) {
            if(this.amount > 0) {
                var took = Math.min(this.amount, amount);
                this.amount -= took;
                if(success) {
                    success(took);
                }
            }

            if(this.amount <= 0) {
                this.dead = true;
                this.amount = 0;
            }
        },
        update: function() {
            this.radius = Math.sqrt(this.amount / Math.PI);
            this.scale = this.radius / 100;
        }
    }, {
        sprite: function(entity) {
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

    sidera.framework.namespace.define('sidera.entities', {
        Asteroid: Asteroid
    });
}());