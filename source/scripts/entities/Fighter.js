define(['entities/Entity', 'math/vector', 'math/geometry', 'assets'], function(Entity, vector, geo, assets) {

    var circle = geo.fullCircle;

    var max_angle = Math.PI / 100;
    var speed = 0.017;
    var range = 4;
    var rechargeRate = 1 * 1000; // ms
    var laser_cooldown = 500; // ms
    var choice = 1;

    var Fighter = Entity.mix('Fighter', function(type) {
        this.enemy = true;
        this.orientation = 0;
        this.laser = 0;
        this.hp = 5;
        this.shoudExplode = true;

        this.cooldown = 0;
        this.untilRecharge = rechargeRate;

        this.target = null;

        this.sprites = assets['fighter.png'];
    });

    Fighter.prototype.render = function(ctx, camera) {

        var coords = camera.project(this);
        var size = 16 * camera.scale;
        var scale = camera.scale;

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

        ctx.rotate(this.orientation);
        ctx.drawImage(this.sprites, 0, 0, 128, 128, -size / 2, -size / 2, size, size);
        ctx.restore();
    };

    Fighter.prototype.update = function(elapsed, gameObjects) {

        // let's only peform the acquisition every other time
        this.work = !this.work;

        if(this.work) {
            this.target = acquireTarget(this, gameObjects);
        }

        // update position every time
        this.x += Math.cos(this.orientation) * speed;
        this.y += Math.sin(this.orientation) * speed;

        if(this.cooldown > 0) {
            this.cooldown -= elapsed;
        }

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

            // fire laser
            if(this.untilRecharge <= 0 && this.target) {
                if(to_target.distance() <= range && (Math.abs(delta) < (Math.PI / 180))) {
                    //attack target
                    this.cooldown = laser_cooldown;
                    this.untilRecharge = rechargeRate;
                    this.target.hit(1);
                }
            }
        }
    };

    Fighter.sprite = function() {
        var canvas = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 20;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(20, 5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, 5);
        ctx.lineTo(0, 10);
        ctx.lineTo(20, 5);
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

    return Fighter;
});