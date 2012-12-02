define(function() {

    return function vector(a, b) {

        if(b === undefined) b = {
            x: 0,
            y: 0
        };

        return {
            x: a.x - b.x,
            y: a.y - b.y,

            distance: function() {
                var d = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
                this.distance = function() {
                    return d;
                };
                return d;
            },
            angle: function() {
                var rads = Math.atan2(this.y, this.x);
                this.angle = function() {
                    return rads;
                }
                return rads;
            },
            normal: function() {
                var v = {
                    x: this.x / this.distance(),
                    y: this.y / this.distance()
                };
                var n = vector(v);
                this.normal = function() {
                    return n;
                };
                return n;
            },

            multiply: function(factor) {
                return vector({
                    x: this.x * factor,
                    y: this.y * factor
                });
            }
        };
    };
});