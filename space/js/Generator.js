(function () {
    'use strict';

    var vector = space.vector;
    var geo = space.geometry;

    var pulse_rate = 2000; //ms
    var output_rate = 10;
    var range = 100;
    var max_battery = 500;

    var Generator = WinJS.Class.derive(space.Entity, function () {
        this.radius = 20;
        this.targets = [];
        this.wires = [];

        this.untilPulse = 0;
        this.charge = 10;
        this.battery = 0;

        this.setup('Generator');

    }, {
        render: function (ctx, ghost) {
            var self = this;

            ctx.strokeStyle = ghost ? 'rgba(0,0,255,0.8)' : 'rgba(255,255,0,1)';

            // self.targets.forEach(function(target) {
            // 	ctx.beginPath();
            // 	ctx.lineWidth = 1;
            // 	ctx.moveTo(self.x, self.y);
            // 	ctx.lineTo(target.x, target.y);
            // 	ctx.stroke();
            // });

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
        },
        update: function (elapsed, entities) {
            if (this.untilPulse <= 0) {
                if (this.battery < max_battery) {
                    this.battery += output_rate;
                }
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

        self.battery = Math.min(self.battery + output_rate, max_battery);

        find_targets(self, entities, function (entity) {

            if (self.targets.indexOf(entity) >= 0) return;

            var wire = new space.Wire(self, entity);
            entities.push(wire);
            self.targets.push(entity);
        });

        var spread = self.targets.length || 1;
        var pressure = self.battery / spread;
        self.targets.forEach(function (target) {
            var used = target.charge(pressure);
             self.battery -= used;
        });
    }

    function find_targets(self, entities, action) {

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
                    if (action) {
                        action(entity);
                    } else {
                        self.targets.push(entity);
                    }
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