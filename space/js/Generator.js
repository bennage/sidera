(function () {
    'use strict';

    var vector = space.vector;
    var geo = space.geometry;

    var pulse_rate = 2000; //ms
    var output_rate = 10;
    var range = 100;
    var max_battery = 500;

    var Generator = WinJS.Class.derive(space.Entity, function () {
        this.setup('Generator');

        this.radius = 20;
        this.wires = [];

        this.untilPulse = 0;
        this.charge = 10;
        this.battery = 0;
    }, {
        render: function (ctx, ghost) {
            var self = this;

            ctx.strokeStyle = ghost ? 'rgba(0,0,255,0.8)' : 'rgba(255,255,0,1)';

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = ghost ? 'rgba(0,0,255,0.8)' : 'blue';
            ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
            ctx.moveTo(self.x, self.y - self.radius);
            ctx.lineTo(self.x, self.y + self.radius);
            ctx.moveTo(self.x - self.radius, self.y);
            ctx.lineTo(self.x + self.radius, self.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = ghost ? 'rgba(0,0,255,0.8)' : fillByCharge(this);
            ctx.arc(self.x, self.y, 8, 0, 2 * Math.PI, false);
            ctx.fill();

            self.wires.forEach(function (wire) {
                wire.render(ctx, ghost);
            });
        },
        update: function (elapsed, entities) {
            // this probably should not be on every update, it is expensive
            find_targets(this, entities);

            if (this.untilPulse <= 0) {
                pulse(this, entities);
                this.untilPulse = pulse_rate;
            } else {
                this.untilPulse = this.untilPulse - elapsed;
            }
        },
        find: find_targets
    }, {
        cost: 500
    });

    function pulse(self, entities) {

        // charge up
        self.battery += output_rate;

        // flow to targets
        var spread = self.wires.length || 1;
        var pressure = self.battery / spread;
        self.wires.forEach(function (wire) {
            var used = wire.tail.charge(pressure);
            self.battery -= used;
        });

        // remove the excess
        self.battery = Math.min(self.battery + output_rate, max_battery);
    }

    function find_targets(self, entities, action) {

        self.wires = [];

        entities.filter(function (entity) {
            return entity.powered && !(self.wires.some(function (wire) {
                return wire.tail === entity;
            }));
        }).forEach(function (entity) {

            var v = vector(self, entity);
            var d = v.distance();
            if ((d - entity.radius) <= range) {

                var blocked = entities.some(function (blocker) {
                    if (blocker === self || blocker === entity) return false;

                    var intersected = geo.lineIntersectsCircle([self, entity], blocker);
                    var projected = geo.pointProjectsOntoSegment(self, entity, blocker)
                    return (intersected && projected);
                });

                if (!blocked) {
                    var wire = new space.Wire(self, entity);
                    self.wires.push(wire);
                }

            }
        })
    }

    function strokeByPulse(self) {
        var alpha = 1 - ((pulse_rate - self.untilPulse) / pulse_rate);
        return 'rgba(255,255,0,' + alpha + ')';
    }

    function fillByCharge(self) {
        var alpha = 1 - ((max_battery - self.battery) / max_battery);
        return 'rgba(255,255,255,' + alpha + ')';
    }

    WinJS.Namespace.define('space', { Generator: Generator });
}());