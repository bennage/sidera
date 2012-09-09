(function () {
    'use strict';

    var Wire = WinJS.Class.define(function (head, tail) {
        this.head = head;
        this.tail = tail;
        this.pumping = 0;
    }, {
        render: function (ctx, scale) {
            var self = this;

            var tail = {
                x: (this.tail.x - this.head.x) * scale,
                y: (this.tail.y - this.head.y) * scale
            };

            ctx.strokeStyle = 'rgba(255,0,0,1)';
            ctx.lineWidth = (1 + (3 * self.pumping)) * scale;

            ctx.moveTo(0, 0);
            ctx.lineTo(tail.x, tail.y);
            ctx.stroke();
        },
        update: function (elapsed, entities) {

        }
    });

    WinJS.Namespace.define('sidera.entities', {
        Wire: Wire
    });

}());