define(function(require) {

    var Entity = require('entities/Entity'),
        MapGrid = require('entities/MapGrid'),
        vector = require('math/vector'),
        geo = require('math/geometry');

    var laser_charge = 5;
    var laser_cooldown = 1 * 1000; // ms
    var max_battery = 25;
    var max_health = 20;
    var max_angle = Math.PI / 30;

    var Turret = Entity.mix('Turret', function() {
        this.sprites = Turret.sprite();

        this.cooldown = 0;
        this.battery = 0;

        this.powered = true;
        this.hp = max_health;
        this.shoudExplode = true;

        this.orientation = (Math.PI * 2) * Math.random(); // start with the turrent pointing a random direction
        this.radius = 1;
        this.range = 4;
    });

    Turret.prototype.render = function(ctx, camera) {

        var coords = camera.project(this);
        var scale = camera.scale;
        var size = MapGrid.cellSize * scale;

        ctx.save();
        ctx.translate(coords.x, coords.y);

        if(this.cooldown > 0 && this.target) {

            var fade = this.cooldown / laser_cooldown;

            var t = camera.project(this.target);

            var p = {
                x: (t.x - coords.x),
                y: (t.y - coords.y)
            };

            ctx.lineWidth = 1 * scale;
            ctx.strokeStyle = 'rgba(255,255,0,' + fade + ')';

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }

        // battery meter
        this.renderMeter(ctx, (this.battery / max_battery), 'yellow', {
            x: 12,
            y: 10
        }, scale);

        // health meter
        this.renderMeter(ctx, (this.hp / max_health), 'green', {
            x: -16,
            y: 10
        }, scale);

        ctx.rotate(this.orientation);
        ctx.drawImage(this.sprites, 0, 0, 128, 128, -size / 2, -size / 2, size, size);

        ctx.restore();
    };

    Turret.prototype.update = function(elapsed, gameObjects) {

        if(this.cooldown > 0) {
            this.cooldown -= elapsed;
        }

        if(this.cooldown > 0 || this.battery < laser_charge) return;

        this.target = acquireTarget(this, gameObjects);

        if(!this.target) return;

        var to_target = vector(this.target, this);

        // track the target
        var delta = this.orientation - to_target.angle();
        if(Math.abs(delta) > Math.PI) {
            delta = (-2 * Math.PI) + Math.abs(delta);
        }
        var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
        var adjust = Math.min(max_angle, Math.abs(delta));
        this.orientation -= (sign * adjust);

        this.orientation = this.orientation % (2 * Math.PI);

        if(to_target.distance() <= this.range && Math.abs(delta) <= max_angle) {
            this.cooldown = laser_cooldown;
            this.battery -= laser_charge;
            this.target.hit(1);
        }
    };

    Turret.prototype.charge = function(available) {
        var capacity = max_battery - this.battery;
        var used = Math.min(available, capacity);
        this.battery += used;
        return used;
    };

    Turret.cost = 20;

    Turret.sprite = function() {
        var canvas = document.createElement('canvas');
        canvas.height = 128;
        canvas.width = 128;

        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.arc(64, 64, 24, 0, 2 * Math.PI, false);
        ctx.fill();

        // cannon
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(0,64,0,1)';

        ctx.beginPath();
        ctx.moveTo(64, 64);
        ctx.lineTo(96, 64);
        ctx.stroke();

        return canvas;
    };

    function acquireTarget(self, gameObjects) {
        var entity, current_distance, closest, last_distance = Number.POSITIVE_INFINITY;

        var entities = gameObjects.enemies;

        for(var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];
            if(entity.enemy) {

                current_distance = geo.lengthSquared(self, entity);

                if(current_distance < last_distance) {
                    last_distance = current_distance;
                    closest = entity;
                }
            }
        }

        return closest;
    }

    return Turret;
});