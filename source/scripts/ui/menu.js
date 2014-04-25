define(function (require) {

    var Entity = require('entities/Entity');

    function centerText(ctx, text, y) {
        var measurement = ctx.measureText(text);
        var x = (ctx.canvas.width - measurement.width) / 2;
        ctx.fillText(text, x, y);
    };

    var Menu = function () {
        Entity.prototype.constructor.call(this, 'Menu');
    };

    Menu.prototype.render = function (ctx) {
        ctx.fillStyle = 'white';
        ctx.font = '48px monospace';
        centerText(ctx, 'Game Paused', 300);
    };

    Menu.prototype.update = function (elapsed) {

    };

    return Menu;
});