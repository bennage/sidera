define(['entities/Entity', 'math/geometry'], function(Entity, geometry) {

    var fullCircle = geometry.fullCircle;

    var Explosion = Entity.extend(function(corpse) {
        this._base(this, 'Explosion');

        this.clouds = [];
        this.x = corpse.x;
        this.y = corpse.y;

        var count = Math.ceil(Math.random() * 5);
        for(var i = 0; i < count; i++) {
            this.clouds.push({
                x: (Math.random() * 20) - 10,
                y: (Math.random() * 20) - 10,
                r: (Math.random() * 20) + 5,
                start: i * (300 / count),
                // start time offset
                life: 300 * Math.random() + 200
            });
        }
    });

    Explosion.prototype.render = function(ctx, camera) {

        var coords = camera.project(this);
        var scale = camera.scale;

        ctx.save();
        ctx.translate(coords.x, coords.y);

        var count = this.clouds.length;
        var puff;
        for(var i = 0; i < count; i++) {
            puff = this.clouds[i];
            if(puff.start > 0) {
                continue;
            }

            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,255,0,' + puff.life / 1000 + ')';
            ctx.arc(puff.x * scale, puff.y * scale, puff.r * scale, 0, fullCircle, false);
            ctx.fill();
        }

        ctx.restore();
    };

    Explosion.prototype.update = function(elapsed) {
        var count = this.clouds.length;
        var puff;
        var alive = false;

        for(var i = 0; i < count; i++) {
            puff = this.clouds[i];
            puff.start -= elapsed;
            if(puff.start <= 0) {
                puff.life -= elapsed;
            }
            if(puff.life >= 0) {
                alive = true;
            }
        }

        if(!alive) {
            this.dead = true;
        }
    };

    return Explosion;

});