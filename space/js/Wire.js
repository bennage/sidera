(function () {
    'use strict';

    var Entity = space.Entity;
    var vector = space.vector;
    var geo = space.geometry;

    var Wire = WinJS.Class.derive(Entity, function (head, tail) {
        this.head = head;
        this.tail = tail;
        this.pumping = 0;
        this.setup('Wire');
    }, {
        render: function (ctx, ghost) {
            var self = this;

            ctx.strokeStyle = 'rgba(255,0,0,1)';
            ctx.lineWidth = 1 + (3 * self.pumping);

            ctx.moveTo(self.head.x, self.head.y);
            ctx.lineTo(self.tail.x, self.tail.y);
            ctx.stroke();
        },
        update: function (elapsed, entities) {

        }
    });

    WinJS.Namespace.define('space', {
        Wire: Wire
    });
}());