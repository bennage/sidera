define(function(require) {

    var Entity = require('entities/Entity');

    var FPS = function() {
        Entity.prototype.constructor.call(this, 'FPS');

        this.x = 300;
        this.y = 20;

        this.frames = 0;
        this.ms = 0;
        this.fps = 0;
    };

    FPS.prototype.render = function(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.font = '18px sans-serif';
        ctx.fillText(this.fps + ' fps', this.x, this.y);
    };

    FPS.prototype.update = function(elapsed) {
        this.frames++;
        this.ms += elapsed;
        if(this.ms > 1000) {
            this.fps = Math.round(this.frames * 1000 / this.ms);
            this.ms = 0;
            this.frames = 0;
        }
    };

    return FPS;
});