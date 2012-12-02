define(function() {

    var Wire = function(head, tail) {
            this.head = head;
            this.tail = tail;
            this.pumping = 0;
        };

    Wire.prototype.render = function(ctx, camera) {
        var self = this;

        var scale = camera.scale;

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
    };
    
    Wire.prototype.update = function(elapsed, entities) {

    };

    return Wire;
});