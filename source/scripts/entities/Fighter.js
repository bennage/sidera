define(function(require) {

    var Entity = require('entities/Entity'),
        vector = require('math/vector'),
        geo = require('math/geometry'),
        assets = require('assets');

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
        //todo: tweak the art so that we don't need to adjust
        var adjusted_theta = this.orientation + circle - (Math.PI/4);
        var normalized_theta = (adjusted_theta % circle) / circle;
        var frame = Math.floor(normalized_theta * 48);
 
        var x0 = (frame % 7) * 64;
        var y0 = Math.floor(frame / 7) * 64;
        var x1 = 64;
        var y1 = 64;
        var size = 32 * camera.scale;

        ctx.drawImage(this.sprites, x0, y0, x1, y1, -size / 2, -size / 2, size, size);

 
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