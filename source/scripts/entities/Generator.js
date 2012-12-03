define(['entities/Entity', 'math/geometry', 'math/vector', 'entities/MapGrid', 'entities/Wire'], function(Entity, geo, vector, MapGrid, Wire) {

    var fullCircle = geo.fullCircle;

    var pulse_rate = 2000; //ms
    var output_rate = 10;
    var max_battery = 500;
    var max_health = 20;

    var Generator = Entity.mix('Generator',function() {
        // this._base(this, 'Generator');

        this.sprites = Generator.sprite();

        this.radius = 2;
        this.wires = [];
        this.hp = max_health;
        this.shoudExplode = true;
        this.untilPulse = 0;
        this.charge = 10;
        this.battery = 0;
        this.range = 4;
    });

    Generator.prototype.render = function(ctx, camera) {

        var coords = camera.project(this);
        var scale = camera.scale;
        var size = MapGrid.cellSize * scale;

        ctx.save();
        ctx.translate(coords.x, coords.y);

        ctx.beginPath();

        ctx.drawImage(this.sprites, 0, 0, 128, 128, -size / 2, -size / 2, size, size);

        ctx.fillStyle = fillByCharge(this);
        ctx.arc(0, 0, 8 * scale, 0, fullCircle, false);
        ctx.fill();

        // health meter
        this.renderMeter(ctx, (this.hp / max_health), 'green', {
            x: -16,
            y: 10
        }, scale);

        // power transfers
        for(var i = this.wires.length - 1; i >= 0; i--) {
            this.wires[i].render(ctx, camera);
        }

        ctx.restore();
    };

    Generator.prototype.update = function(elapsed, gameObjects) {

        if(this.untilPulse <= 0) {
            pulse(this);
            this.untilPulse = pulse_rate;

            find_targets(this, gameObjects);
        } else {
            this.untilPulse = this.untilPulse - elapsed;
        }
    };

    Generator.prototype.whenBuilding = function(building, gameObjects) {
        find_targets(this, gameObjects);
    };


    Generator.cost = 500;
    Generator.sprite = function() {
        var canvas = document.createElement('canvas');
        canvas.height = 128;
        canvas.width = 128;

        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'blue';
        ctx.arc(64, 64, 60, 0, fullCircle, false);
        ctx.moveTo(64, 4);
        ctx.lineTo(64, 124);
        ctx.moveTo(4, 64);
        ctx.lineTo(124, 64);
        ctx.stroke();

        return canvas;
    };

    function pulse(self) {

        // charge up
        self.battery += output_rate;

        // flow to targets
        var spread = self.wires.length || 1;
        var pressure = self.battery / spread;
        self.wires.forEach(function(wire) {
            var used = wire.tail.charge(pressure);
            self.battery -= used;
        });

        // remove the excess
        self.battery = Math.min(self.battery + output_rate, max_battery);
    }

    function find_targets(self, gameObjects) {

        var entities = gameObjects.friendlies;

        self.wires = [];

        var entity, already_connected, distance_to_entity, distance_to_edge, blocker, blocked, intersected, projected;

        for(var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];

            // we don't care about unpowered entities
            if(!entity.powered) {
                continue;
            }

            // are we already connected to the entity?
            already_connected = false;
            for(var j = self.wires.length - 1; j >= 0; j--) {
                if(self.wires[j].tail === entity) {
                    already_connected = true;
                    break;
                }
            }

            if(already_connected) {
                continue;
            }

            // is the entity within range?
            distance_to_entity = vector(self, entity).distance();
            distance_to_edge = distance_to_entity - entity.radius;

            if(distance_to_edge > self.range) {
                continue;
            }

            // is the entity blocked?
            blocked = false;
            for(var j = entities.length - 1; j >= 0; j--) {
                blocker = entities[j];
                if(blocker === self || blocker === entity) {
                    continue;
                };

                // todo: these are very expensive
                // let's find a way to call them less frequently
                intersected = geo.lineIntersectsCircle([self, entity], blocker);
                projected = geo.pointProjectsOntoSegment(self, entity, blocker)
                blocked = (intersected && projected);

                // if(blocked) {
                //     break;
                // }
            }

            // if we are not blocked, create a new wire
            if(!blocked) {
                self.wires.push(new Wire(self, entity));
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

    return Generator;
});