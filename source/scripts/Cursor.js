define(function(require) {

    var mouse = require('mouse'),
        Entity = require('entities/Entity'),
        geometry = require('math/geometry'),
        MapGrid = require('entities/MapGrid');

    var Cursor = Entity.mix('Cursor', function(camera) {
        this.camera = camera;
        this._entity = null;
        this.mode = 'nothing';
        this.overValidPlacement = true;
        this.range = 0;
        this.on = false;
        this.worldSpace = {
            x: -1,
            y: -1
        };
    });

    Cursor.prototype.render = function(ctx, camera) {
        if(!this.on || !this._entity) {
            return;
        }

        var scale = camera.scale;
        var cellSize = MapGrid.cellSize * scale;
        var offset = cellSize / 2;

        // center on the cell in focus
        var coords = camera.project(this.worldSpace);
        ctx.save();
        ctx.translate(coords.x, coords.y);

        // render red highlight if the placement is invalid
        if(!this.overValidPlacement) {
            ctx.beginPath()
            ctx.arc(0, 0, offset, 0, geometry.fullCircle, false);
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
            ctx.fill();
        }

        // render the range of the entity (if applicable)
        if(this.range > 0) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.arc(0, 0, this.range * cellSize, 0, geometry.fullCircle, false);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
        }

        // render the actual sprite of the entity
        ctx.globalAlpha = 0.3
        ctx.drawImage(this._entity.sprites, -offset, -offset, cellSize, cellSize);

        ctx.restore();
    };

    Cursor.prototype.update = function(elapsed, gameObjects) {
        if(!this.on) {
            return;
        }
        var mouseState = mouse.getState();

        var rate = 0.25;

        if(!this._entity || !this._entity.range || !this.overValidPlacement) {
            if(this.range > 0) this.range -= rate;
        } else {
            if(this.range < this._entity.range) this.range += rate;
            if(this.range > this._entity.range) this.range -= rate;
        }

        if(!this._entity) {
            return;
        }

        this.worldSpace = this.camera.toWorldSpace(mouseState);
        this.worldSpace.x = Math.round(this.worldSpace.x);
        this.worldSpace.y = Math.round(this.worldSpace.y);

        this._entity.x = this.x = this.worldSpace.x;
        this._entity.y = this.y = this.worldSpace.y;

        var blockers = gameObjects.friendlies.concat(gameObjects.enviroment);
        this.overValidPlacement = this.canPlace(blockers);
    };

    Cursor.prototype.setContext = function(type) {
        if(!type) return;

        this.context = type;
        this._entity = new type();
        this.mode = this._entity.type;

        this.find = (this._entity.find) ? this._entity.find.bind(this._entity) : function() { };
    };

    Cursor.prototype.click = function(coords, level, gameObjects) {

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
    };

    return Cursor;

});