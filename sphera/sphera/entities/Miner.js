(function () {
    'use strict';

    var vector = sphera.math.vector;
    var geo = sphera.math.geometry;

    var pulse_rate = 2500; //ms
    var mine_rate = 10;
    var range = 100;
    var required_charge = 5;
    var max_battery = 15;
    var max_health = 5;

    var counter = 0;

    var Miner = WinJS.Class.derive(sphera.entities.Entity, function () {
        counter++;
        this.setup('Miner');

        this.id = counter;

        this.untilPulse = 0;
        this.battery = 0;
        this.targets = [];

        this.powered = true;
        this.hp = max_health;

        this.radius = 10;
    }, {
        render: function (ctx, ghost) {
            var self = this;

            ctx.strokeStyle = ghost ? 'rgba(255,255,255,0.2)' : strokeByPulse(this);
            ctx.lineWidth = 1;

            self.targets.forEach(function (target) {
                ctx.beginPath();
                ctx.moveTo(self.x, self.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            });

            ctx.beginPath();
            ctx.fillStyle = ghost ? 'rgba(255,255,255,0.2)' : 'gray';
            ctx.arc(self.x, self.y, 10, 0, 2 * Math.PI, false);
            ctx.fill();

            // battery meter
            this.renderMeter(ctx, (this.battery / max_battery), 'yellow', { x: 12, y: 10 });

            // health meter
            this.renderMeter(ctx, (this.hp / max_health), 'green', { x: -16, y: 10 });

            //id
            ctx.fillStyle = "white";
            ctx.font = "10px sans-serif";
            ctx.fillText(this.id, self.x, self.y - 10);
        },
        update: function (elapsed, entities) {
            if (this.untilPulse <= 0) {
                pulse(this, entities);

                this.untilPulse = pulse_rate;

            } else {
                this.untilPulse = this.untilPulse - elapsed;
            }
        },
        charge: function (available) {
            var capacity = max_battery - this.battery;
            var used = Math.min(available, capacity);
            this.battery += used;
            return used;
        },        
        find: find_targets
    }, {
        cost: 100,
    });

    function strokeByPulse(self) {
        var alpha = 1 - ((pulse_rate - self.untilPulse) / pulse_rate);
        return 'rgba(0,255,0,' + alpha + ')';
    }

    function pulse(self, entities) {
        self.targets = [];

        find_targets(self, entities, function (entity) {
            if (self.battery < required_charge) return;
            self.battery -= required_charge;

            entity.mine(mine_rate, self.onmining);

            self.targets.push(entity);
        });
    }

    function find_targets(self, entities, action) {

        entities.filter(function (entity) {
            return !!entity.mine;
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

    WinJS.Namespace.define('sphera.entities', { Miner: Miner });
}());