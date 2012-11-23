(function() {
    'use strict';

    var Entity = sidera.entities.Entity;
    var fullCircle = sidera.math.geometry.fullCircle;

    var Cursor = sidera.framework.class.derive(Entity, function() {
        Entity.prototype.constructor.call(this, 'Cursor');
    }, {
        _entity: null,
        mode: 'nothing',
        overValidPlacement: true,

        render: function(ctx, camera) {
            var e = this._entity;

            if(!e) {
                return;
            }

            var scale = camera.scale;
            var _e = camera.project(e);

            if(e.range && this.overValidPlacement) {
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.arc(_e.x, _e.y, e.range * scale, 0, fullCircle, false);
                ctx.stroke();
                ctx.fill();
            }

            if(!this.overValidPlacement) {
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255,0,0,0.9)';
                ctx.arc(e.x, e.y, e.radius + 3, 0, fullCircle, false);
                ctx.fill();
            }

            var w = Math.floor(e.sprites.width * e.scale);
            var h = Math.floor(e.sprites.height * e.scale);

            ctx.save();

            ctx.translate(e.x, e.y);

            if(e.orientation) {
                ctx.rotate(e.orientation);
            }

            ctx.drawImage(e.sprites, -w / 2, -h / 2, w, h);

            ctx.restore();


        },

        update: function(elapsed, gameObjects) {
            if(!this._entity) return;

            this._entity.x = this.x;
            this._entity.y = this.y;

            if(this._entity.find) {
                this._entity.find(this._entity, gameObjects);
            }

            this.overValidPlacement = this.canPlace(gameObjects.friendlies.concat(gameObjects.enviroment));

        },

        setContext: function(type) {
            if(!type) return;

            this.context = type;
            this._entity = new type();
            this.mode = this._entity.type;

            this.find = (this._entity.find) ? this._entity.find.bind(this._entity) : function() {};
        },

        click: function(coords, level, gameObjects) {

            if(!this.context.cost) throw new Error('no cost for context: ' + this.context);

            if(level.money < this.context.cost) return;

            level.money -= this.context.cost;

            var entity = new this.context();

            entity.hydrate({
                x: coords.x,
                y: coords.y,
                onmining: function(take) {
                    level.money += take;
                }
            });

            return entity;
        }
    });

    sidera.framework.namespace.define('sidera', {
        Cursor: Cursor
    });
}());