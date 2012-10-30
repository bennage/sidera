(function() {
    'use strict';

    var Entity = sidera.entities.Entity;

    var Status = sidera.framework.class.derive(Entity, function(state) {
        Entity.prototype.constructor.call(this, 'Status');

        this.x = 10;
        this.y = 20;
        this.state = state;

    }, {

        render: function(ctx) {
            ctx.fillStyle = 'white';
            ctx.font = '18px sans-serif';
            ctx.fillText('$' + this.state.money + ' >> ' + this.mode, this.x, this.y);
        },

        update: function(elapsed) {}
    });

    sidera.framework.namespace.define('sidera', {
        Status: Status
    });
}());