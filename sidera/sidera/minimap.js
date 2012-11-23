(function() {
    'use strict';

    var Entity = sidera.entities.Entity;

    var MiniMap = sidera.framework.class.derive(Entity, function(gameObjects, camera) {
        Entity.prototype.constructor.call(this, 'MiniMap');

        this.cellSize = 5;
        this.w = this.cellSize * sidera.entities.MapGrid.columns;
        this.h = this.cellSize * sidera.entities.MapGrid.rows;

        var canvas = document.createElement('canvas');
        canvas.height = this.h;
        canvas.width = this.w;

        this.map = canvas.getContext('2d');

        this.gameObjects = gameObjects;
        this.camera = camera;

        this.colors = {};
        this.colors['enviroment'] = 'blue';
        this.colors['friendlies'] = 'green';
        this.colors['enemies'] = 'red';

        this.x = 20;
        this.y = 420;
        this.on = false;
        this.lastToggle = new Date();
    }, {
        commands: {
            77: function() {
                //m
                var now = new Date();
                if(now - this.lastToggle > 500) {
                    this.on = !this.on;
                    this.lastToggle = now;
                }
            }
        },
        render: function(ctx) {
            if(!this.on) {
                return;
            }

            var self = this;

            this.renderMap(this.map);
            ctx.drawImage(this.map.canvas, this.x, this.y);

            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.stroke();

        },
        renderMap: function(ctx) {
            var self = this;

            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.rect(0, 0, this.w, this.h);
            ctx.fill();

            Object.keys(this.colors).forEach(function(key) {
                var entities = self.gameObjects[key];
                ctx.fillStyle = self.colors[key];

                var i, entity;
                var x, y, r;
                for(i = entities.length - 1; i >= 0; i--) {
                    entity = entities[i];
                    x = Math.round(entity.x * self.cellSize);
                    y = Math.round(entity.y * self.cellSize);
                    r = Math.round(entity.radius) || 1;

                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
            });

            // camera position and view
            var cellSize = sidera.entities.MapGrid.cellSize;
            ctx.save();
            ctx.translate(this.camera.x, this.camera.y);
            ctx.beginPath();
            ctx.rect(0, 0, this.camera.viewport.width/cellSize, this.camera.viewport.height/cellSize);
            ctx.strokeStyle = 'rgb(0,255,255)';
            ctx.stroke();
            ctx.restore();
        },

        update: function(elapsed) {
            this.checkCommands();
        }
    });

    sidera.framework.namespace.define('sidera', {
        MiniMap: MiniMap
    });
}());