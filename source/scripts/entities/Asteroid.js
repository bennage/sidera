define(['entities/Entity', 'assets'], function(Entity, assets) {

    var Asteroid = Entity.extend(function() {
        this._base(this, 'Asteroid');

        this.amount = 0;
        this.frame = Math.random() * 60;
        this.sprites = assets['rocks.png'];
    });

    Asteroid.prototype.render = function(ctx, camera) {

        //TODO
        this.frame += 0.1;
        if(this.frame > 60) this.frame %= 60;

        var frame = Math.floor(this.frame);
        var x0 = (frame % 8) * 128;
        var y0 = Math.floor(frame / 8) * 128;
        var x1 = 128;
        var y1 = 128;
        var size = 128 * this.size * camera.scale;

        var coords = camera.project(this);
        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.drawImage(this.sprites, x0, y0, x1, y1, -size / 2, -size / 2, size, size);
        ctx.fillStyle = "white";
        ctx.font = "8px sans-serif";
        ctx.fillText(this.x + ',' + this.y, this.x, this.y);
        ctx.restore();
    };

    Asteroid.prototype.mine = function(amount, success) {
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
    };

    Asteroid.prototype.update = function() {
        this.radius = this.amount / 1000;
        this.size = this.radius / 10;
    };

    return Asteroid;
});