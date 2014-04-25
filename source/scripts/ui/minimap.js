define(function (require) {

    var Entity = require('entities/Entity'),
        MapGrid = require('entities/MapGrid'),
        input = require('input/provider'),
        resolution = require('resolution');

    var unitSize = 5; // how many pixels is 1 unit of worldspace?

    var MiniMap = function (gameObjects, camera) {

        Entity.prototype.constructor.call(this, 'MiniMap');

        this.gameObjects = gameObjects;
        this.camera = camera;

        // To create the correct size minimap, multiply the the grid by the unit
        // size we're using for the minimap. We'll also add an extra row/column 
        // for padding so that entities on the edge of the grid won't be on the
        // edge of the minimap. 
        this.w = unitSize * (MapGrid.columns + 2);
        this.h = unitSize * (MapGrid.rows + 2);

        // We use this offset when rendering entities to the minimap to account
        // for the padding.
        this.entityOffset = unitSize;

        // The minimap is rendered to an independent canvas, and this canvas is 
        // later rendered to the main screen.
        var canvas = document.createElement('canvas');
        canvas.height = this.h;
        canvas.width = this.w;

        this.map = canvas.getContext('2d');

        this.colors = {
            enviroment: 'blue',
            friendlies: 'green',
            enemies: 'red'
        };

        // Determine where to render the minimap with respect to the screen
        var pad = 20;
        this.x = pad;
        this.y = resolution.height - this.h - pad;
        this.bounds = {
            top: this.y,
            left: this.x,
            bottom: this.y + this.h,
            right: this.x + this.w
        };

        this.on = true;
        this.lastToggle = new Date();
    };

    MiniMap.prototype.commands = {
        77 /* m */: {
            command: function () { this.on = !this.on; },
            delay: 300
        }
    };

    MiniMap.prototype.render = function (ctx) {

        if (this.on) {
            this.renderMap(this.map);
            ctx.drawImage(this.map.canvas, this.x, this.y);

            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255,255,255, 0.3)';
            ctx.stroke();
        } else {
            ctx.fillStyle = 'rgba(255,255,255, 0.3)';
            ctx.font = '42px sans-serif';
            ctx.fillText('M', this.x, this.y + 140);
        }
    };

    MiniMap.prototype.renderMap = function (ctx) {
        var self = this;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.rect(0, 0, this.w, this.h);
        ctx.fill();

        Object.keys(this.colors).forEach(function (key) {
            var entities = self.gameObjects[key];
            ctx.fillStyle = self.colors[key];

            var i, entity;
            var x, y, r;
            for (i = entities.length - 1; i >= 0; i--) {
                entity = entities[i];
                r = Math.round(entity.radius || 1);
                x = Math.round(entity.x * unitSize) + self.entityOffset;
                y = Math.round(entity.y * unitSize) + self.entityOffset;

                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                ctx.fill();
            }
        });

        // camera position and view
        var viewport = this.camera.viewport;

        var w = (viewport.width / MapGrid.cellSize) * unitSize;
        var h = (viewport.height / MapGrid.cellSize) * unitSize;

        var cx = this.camera.x * unitSize + self.entityOffset;
        var cy = this.camera.y * unitSize + self.entityOffset;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.rect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = 'rgba(0,255,255,0.3)';
        ctx.stroke();

        ctx.restore();
    };

    MiniMap.prototype.update = function (elapsed) {
        this.checkCommands();

        if (!input.state.handled && input.state.hasPointer) {

            var inBound = input.isPointWithinBounds(input.state, { left: this.x, right: this.x + this.w, top: this.y, bottom: this.y + this.h });

            if (inBound) {
                this.down = true;
                input.state.handled = true;
            }
        }

        if (!input.state.hasPointer && this.down) {
            this.on = !this.on;
            this.down = false;
            input.state.handled = true;
        }

    };

    return MiniMap;

});