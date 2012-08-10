(function () {
    'use strict';

    var vector = sphera.math.vector;
    var geo = sphera.math.geometry;

    var pulse_rate = 2000; //ms
    var output_rate = 10;
    var range = 100;
    var max_battery = 500;
    var max_health = 20;
    var Generator = WinJS.Class.derive(sphera.entities.Entity, function () {
        this.setup('Generator');

        this.radius = 20;
        this.wires = [];
        this.hp = max_health;
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

            // health meter
            this.renderMeter(ctx, (this.hp / max_health), 'green', { x: -16, y: 10 });

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

        var entity,
            already_connected,
            distance_to_entity,
            distance_to_edge,
            blocker,
            blocked,
            intersected,
            projected;

        for (var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];

            // we don't care about unpowered entities
            if (!entity.powered) { continue; }

            // are we already connected to the entity?
            already_connected = false;
            for (var j = self.wires.length - 1; j >= 0; j--) {
                if (self.wires[j].tail === entity) {
                    already_connected = true;
                    break;
                }
            }

            if (already_connected) { continue; }

            // is the entity within range?
            distance_to_entity = vector(self, entity).distance();
            distance_to_edge = distance_to_entity - entity.radius;

            if (distance_to_edge > range) { continue; }

            // is the entity blocked?
            blocked = false;
            for (var j = entities.length - 1; j >= 0; j--) {
                blocker = entities[j];
                if (blocker === self || blocker === entity) { continue; };

                // todo: these are very expensive
                // let's find a way to call them less frequently
                intersected = geo.lineIntersectsCircle([self, entity], blocker);
                projected = geo.pointProjectsOntoSegment(self, entity, blocker)
                blocked = (intersected && projected);

                if (blocked) { break; }
            }

            // if we are not blocked, create a new wire
            if (!blocked) {
                self.wires.push(new sphera.entities.Wire(self, entity));
            }
        }
    }

    function strokeByPulse(self) {
        var alpha = 1 - ((pulse_rate - self.untilPulse) / pulse_rate);
        return 'rgba(255,255,0,' + alpha + ')';
    }

    function fillByCharge(self) {
        var alpha = 1 - ((max_battery - self.battery) / max_battery);
        return 'rgba(255,255,255,' + alpha + ')';
    }

    WinJS.Namespace.define('sphera.entities', { Generator: Generator });
}());