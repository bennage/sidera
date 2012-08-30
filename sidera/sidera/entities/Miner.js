(function () {
    'use strict';

    var Entity = sidera.entities.Entity;

    var vector = sidera.math.vector;
    var geo = sidera.math.geometry;

    var pulse_rate = 2500; //ms
    var mine_rate = 10;
    var required_charge = 5;
    var max_battery = 15;
    var max_health = 5;

    var Miner = WinJS.Class.derive(Entity, function () {
        Entity.prototype.constructor.call(this, 'Miner');

        this.untilPulse = 0;
        this.battery = 0;
        this.targets = [];

        this.powered = true;
        this.hp = max_health;
        this.shoudExplode = true;

        this.radius = 10;
        this.range = 100;
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

    function find_targets(self, gameObjects, action) {
        //TODO: convert to for loop
        gameObjects.enviroment
            .filter(function (entity) {
                return !!entity.mine;
            })
            .forEach(function (entity) {

                var v = vector(self, entity);
                var d = v.distance();
                if ((d - entity.radius) <= self.range) {
                    var candidates = gameObjects.enviroment.concat(gameObjects.friendlies);
                    var blocked = candidates.some(function (blocker) {
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

    WinJS.Namespace.define('sidera.entities', { Miner: Miner });
}());