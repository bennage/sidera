define(function(require) {

    var Entity = require('entities/Entity');

    var Status = function(state) {
        Entity.prototype.constructor.call(this, 'Status');

        this.x = 10;
        this.y = 20;
        this.state = state;

    };

    Status.prototype.render = function(ctx) {
        ctx.fillStyle = 'white';
        ctx.font = '18px sans-serif';
        ctx.fillText('$' + this.state.money, this.x, this.y);
    };

    Status.prototype.update = function(elapsed) { };

    return Status;

});