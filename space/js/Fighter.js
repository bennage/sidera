(function () {
    'use strict';

    var vector = space.vector;
    var geo = space.geometry;

    var Fighter = WinJS.Class.derive(space.Entity, function () {

        this.setup('Fighter');
        this.orientation = Math.PI/3;
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('width', 40);
        this.canvas.setAttribute('height', 40);
        this.ctx = this.canvas.getContext('2d');

    }, {
        render: function (ctx, ghost) {
            var self = this;
            var local = this.ctx;

            local.clearRect(0,0,40,40);
            local.strokeStyle = 'gray';
            local.fillStyle = 'gray';
            local.lineWidth = 1;
            local.save();
            local.translate(20,20);
            local.rotate(this.orientation);

            local.beginPath();
            local.moveTo(-20, 0);
            local.lineTo(20, -10);
            local.lineTo(10, 0);
            local.lineTo(20, 10);
            local.lineTo(-20, 0);

            local.fill();
            local.restore();

            var x = self.x;
            var y = self.y;
            ctx.drawImage(this.canvas, x, y);
        },
        update: function (elapsed, entities) {
            var angle = (Math.PI / 1800) * elapsed;
            this.orientation += angle;
            this.orientation %= (2 * Math.PI);
        },

        find: find_targets
    });

    function strokeByPulse(self) {
        var alpha = 1 - ((pulse_rate - self.untilPulse) / pulse_rate);
        return 'rgba(0,255,0,' + alpha + ')';
    }

    function pulse(self, entities) {
        self.targets = [];

        find_targets(self, entities, function (entity) {
            if (self.battery < required_charge) return;
            console.log('mining ' + self.id + ' w/' + self.battery);
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

    WinJS.Namespace.define('space', { Fighter: Fighter });
}());