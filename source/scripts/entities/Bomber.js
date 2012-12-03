define(['entities/Fighter', 'entities/Missile', 'math/vector', 'math/geometry'], function(Fighter, Missile, vector, geo) {

    var circle = geo.fullCircle;

    var max_angle = Math.PI / 300;
    var speed = 0.007;
    var range = 6;
    var reloadRate = 1 * 4000; // ms
    var choice = 1;

    var Bomber = Fighter.extend(function() {
        this._base(this, 'Bomber');

        this.untilRecharge = reloadRate * Math.random() + 1000;
        this.sprites = Bomber.sprite();
    });

    Bomber.prototype.render = function(ctx, camera) {
        var coords = camera.project(this);
        var scale = camera.scale;

        var ws = 40 * scale * 0.6; // 0.6 is an arbitrary scaled to make it "look" right
        var hs = 20 * scale * 0.6;

        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.rotate(this.orientation);
        ctx.drawImage(this.sprites, 0, 0, 40, 20, -ws / 2, -hs / 2, ws, hs);
        ctx.restore();
    };

    Bomber.prototype.update = function(elapsed, gameObjects) {

        // let's only peform the acquisition every other time
        this.work = !this.work;

        if(this.work) {
            this.target = acquireTarget(this, gameObjects);
        }

        // update position every time
        this.x += Math.cos(this.orientation) * speed;
        this.y += Math.sin(this.orientation) * speed;

        if(this.untilRecharge > 0) {
            this.untilRecharge -= elapsed;
        }

        if(this.orientation > circle) {
            this.orientation = this.orientation % circle;
        }

        if(!this.target) {
            return;
        }

        var to_target = vector(this.target, this);

        // we're too close, turn away
        if(to_target.distance() < 1) {

            // where should we turn to?
            if(!this.focus) {

                var current_angle = to_target.angle();
                var new_angle = current_angle + (circle / 4 * choice); // or minus
                var some_distance = 2;
                choice *= -1;

                this.focus = {
                    x: this.target.x + (some_distance * Math.cos(new_angle)),
                    y: this.target.y + (some_distance * Math.sin(new_angle))
                };
            }

            var target_angle = vector(this.focus, this).angle();

            var delta = this.orientation - target_angle;
            if(Math.abs(delta) > Math.PI) {
                delta = (-circle) + Math.abs(delta);
            }
            var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
            var adjust = Math.min(max_angle, Math.abs(delta));
            this.orientation -= (sign * adjust);
        }

        if((to_target.distance() > 2 && this.focus) || !this.focus) {
            this.focus = null;
            var delta = this.orientation - to_target.angle();
            if(Math.abs(delta) > Math.PI) {
                delta = (-circle) + Math.abs(delta);
            }
            var sign = (delta !== 0) ? Math.abs(delta) / delta : 1;
            var adjust = Math.min(max_angle, Math.abs(delta));
            this.orientation -= (sign * adjust);

            // fire missle
            if(this.untilRecharge <= 0 && this.target) {
                if(to_target.distance() <= range && (Math.abs(delta) < (Math.PI / 180))) {
                    // attack target
                    this.untilRecharge = reloadRate;
                    this.fire(this.target, gameObjects.enemies);
                }
            }
        }
    };

    Bomber.prototype.fire = function(target, entities) {
        var missile = new Missile(this, target);
        entities.push(missile);
    };


    Bomber.sprite = function() {
        var canvas = document.createElement('canvas');
        canvas.height = 20;
        canvas.width = 40;

        var ctx = canvas.getContext('2d');

        ctx.fillStyle = 'darkred';
        ctx.strokeStyle = 'darkred';

        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(40, 0);
        ctx.bezierCurveTo(26, 14, 26, 6, 40, 20);
        ctx.lineTo(0, 16);
        ctx.bezierCurveTo(13, 10, 13, 10, 0, 4);
        ctx.fill();

        return canvas;
    };

    function acquireTarget(self, gameObjects) {
        var entity, current_distance, closest, last_distance = Number.POSITIVE_INFINITY;

        var entities = gameObjects.friendlies;

        for(var i = entities.length - 1; i >= 0; i--) {

            entity = entities[i];
            if((entity !== self) && !entity.enemy && entity.hp) {

                current_distance = geo.lengthSquared(self, entity);

                if(current_distance < last_distance) {
                    last_distance = current_distance;
                    closest = entity;
                }
            }
        }

        return closest;
    }

    return Bomber;
});