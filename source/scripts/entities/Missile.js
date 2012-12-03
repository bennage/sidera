define(function() {

    var Entity = require('entities/Entity');
    var vector = require('math/vector');
    var geo = require('math/geometry');

    var circle = geo.fullCircle;

    var Missile = Entity.mix('Missile',function(position, target) {
        // this._base(this, 'Missile');

        this.x = position.x;
        this.y = position.y;

        this.target = target;

        this.orientation = 0;
        this.thrust = 0.017;
        this.hp = 1;
        this.shoudExplode = true;
        this.enemy = true;
        this.orient(target);

        this.sprites = Missile.sprite();
    });

    Missile.prototype.render = function(ctx, camera) {
        var coords = camera.project(this);
        var size = 4 * camera.scale;
        var scale = camera.scale;

        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.rotate(this.orientation);
        ctx.drawImage(this.sprites, 0, 0, 4, 4, -size / 2, -size / 2, size, size);
        ctx.restore();
    };

    Missile.prototype.orient = function(target) {
        var to_target = vector(target, this);
        this.orientation = to_target.angle();
    };


    Missile.prototype.update = function(elapsed, gameObjects) {
        this.x += Math.cos(this.orientation) * this.thrust;
        this.y += Math.sin(this.orientation) * this.thrust;

        if(!this.target) {
            return;
        }
        if(this.target.dead) {
            this.target = null;
            return;
        }

        var to_target = vector(this.target, this);
        if(to_target.distance() - this.target.radius < 0) {
            this.target.hit(20);
            this.dead = true;
        }
    };

    Missile.sprite = function() {

        var canvas = document.createElement('canvas');
        canvas.height = 4;
        canvas.width = 4;

        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,0,1)';
        ctx.arc(2, 2, 2, 0, circle, false);
        ctx.fill();

        return canvas;
    };

    return Missile;
});