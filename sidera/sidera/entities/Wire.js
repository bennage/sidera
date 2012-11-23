(function () {
    'use strict';

    var Wire = sidera.framework.class.define(function (head, tail) {
        this.head = head;
        this.tail = tail;
        this.pumping = 0;
    }, {
        render: function (ctx, camera) {
            var self = this;

            var scale = camera.scale();
            
            // var coords = {
            //     x: (this.tail.x - this.head.x),
            //     y: (this.tail.y - this.head.y)
            // };

            var tail = camera.project(this.tail);
            var head = camera.project(this.head);
            var coords = {
                x: (tail.x - head.x),
                y: (tail.y - head.y)
            };

            ctx.strokeStyle = 'rgba(255,0,0,1)';
            ctx.lineWidth = (1 + (3 * self.pumping)) * scale;

            ctx.moveTo(0, 0);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        },
        update: function (elapsed, entities) {

        }
    });

    sidera.framework.namespace.define('sidera.entities', {
        Wire: Wire
    });

}());