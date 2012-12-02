define(function() {

    var Entity = require('entities/Entity');
    var assets = require('assets');

    var vector = require('math/vector');
    var geo = require('math/geometry');

    var pulse_rate = 2500; //ms
    var mine_rate = 10;
    var required_charge = 5;
    var max_battery = 15;
    var max_health = 5;

    var Miner = function() {
            Entity.prototype.constructor.call(this, 'Miner');

            this.sprites = assets['miner.png'];

            this.untilPulse = 0;
            this.battery = 0;
            this.targets = [];

            this.powered = true;
            this.hp = max_health;
            this.shoudExplode = true;

            this.radius = 1;
            this.range = 3;

        };

    Miner.prototype.render = function(ctx, camera) {

        var scale = camera.scale;
        var size = sidera.entities.MapGrid.cellSize * scale;

        var coords = camera.project(this);
        ctx.save();
        ctx.translate(coords.x, coords.y);

        ctx.drawImage(this.sprites, 0, 0, 128, 128, -size / 2, -size / 2, size, size);
        ctx.fillStyle = "white";
        ctx.font = "8px sans-serif";
        ctx.fillText(this.x + ',' + this.y, this.x, this.y);

        ctx.strokeStyle = strokeByPulse(this);
        ctx.lineWidth = 1 * scale;

        //todo: no forEach!
        var self = this;
        this.targets.forEach(function(target) {
            var t = camera.project(target);
            var c = {
                x: (t.x - coords.x),
                y: (t.y - coords.y)
            };
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
        });

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

        ctx.restore();

    };

    Miner.prototype.update = function(elapsed, entities) {
        if(this.untilPulse <= 0) {
            pulse(this, entities);

            this.untilPulse = pulse_rate;

        } else {
            this.untilPulse = this.untilPulse - elapsed;
        }
    };

    Miner.prototype.charge = function(available) {
        var capacity = max_battery - this.battery;
        var used = Math.min(available, capacity);
        this.battery += used;
        return used;
    };

    Miner.cost = 100;

    Miner.sprite = function() {
        var canvas = document.createElement('canvas');
        canvas.height = 20;
        canvas.width = 20;

        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = 'gray';
        ctx.arc(10, 10, 10, 0, 2 * Math.PI, false);
        ctx.fill();

        return canvas;
    };

    function strokeByPulse(self) {
        var alpha = 1 - ((pulse_rate - self.untilPulse) / pulse_rate);
        return 'rgba(0,255,0,' + alpha + ')';
    }

    function pulse(self, gameObjects) {
        self.targets = [];

        var candidate;
        var len = gameObjects.enviroment.length - 1;
        for(var i = len; i != 0; i--) {

            if(self.battery < required_charge) return;

            candidate = gameObjects.enviroment[i];
            if(!candidate.mine) {
                continue;
            }
            var v = vector(self, candidate);
            var d = v.distance();
            if(d > self.range) {
                continue;
            }

            self.battery -= required_charge;
            candidate.mine(mine_rate, self.onmining);

            self.targets.push(candidate);
        }
    }

    return Miner;
});