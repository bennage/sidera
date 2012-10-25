(function () {
    'use strict';

    var Entity = sidera.entities.Entity;

    var vector = sidera.math.vector;
    var geo = sidera.math.geometry;
    var fullCircle = geo.fullCircle;

    var pulse_rate = 2000; //ms
    var output_rate = 10;
    var max_battery = 500;
    var max_health = 20;

    var Generator = sidera.framework.class.derive(Entity, function () {
        Entity.prototype.constructor.call(this, 'Generator');

        this.sheet = Generator.sprite();

        this.radius = 20;
        this.wires = [];
        this.hp = max_health;
        this.shoudExplode = true;
        this.untilPulse = 0;
        this.charge = 10;
        this.battery = 0;
        this.range = 100;

    }, {

        render: function (ctx, scale) {

            ctx.beginPath();
            ctx.fillStyle = fillByCharge(this);
            ctx.arc(0, 0, 8, 0, fullCircle, false);
            ctx.fill();

            // health meter
            this.renderMeter(ctx, (this.hp / max_health), 'green', { x: -16, y: 10 }, scale);

            // power transfers
            for (var i = this.wires.length - 1; i >= 0; i--) {
                this.wires[i].render(ctx, scale);
            }
        },

        update: function (elapsed, gameObjects) {

            if (this.untilPulse <= 0) {
                pulse(this);
                this.untilPulse = pulse_rate;
            } else {
                this.untilPulse = this.untilPulse - elapsed;
            }
        },

        find: find_targets,

        whenBuilding: function (building, gameObjects) {
            find_targets(this, gameObjects);
        }

    }, {
        cost: 500,
        sprite: function () {
            var canvas = document.createElement('canvas');
            canvas.height = 40;
            canvas.width = 40;

            var ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.arc(20, 20, 20, 0, fullCircle, false);
            ctx.moveTo(20, 0);
            ctx.lineTo(20, 40);
            ctx.moveTo(0, 20);
            ctx.lineTo(40, 20);
            ctx.stroke();

            return canvas;
        }
    });

    function pulse(self) {

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

    function find_targets(self, gameObjects) {

        var entities = gameObjects.friendlies;

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

            if (distance_to_edge > self.range) { continue; }

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
                self.wires.push(new sidera.entities.Wire(self, entity));
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

    sidera.framework.namespace.define('sidera.entities', { Generator: Generator });
}());