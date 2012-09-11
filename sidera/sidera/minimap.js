(function () {
    'use strict';

    var Entity = sidera.entities.Entity;

    var MiniMap = WinJS.Class.derive(Entity, function (gameObjects, camera) {
        Entity.prototype.constructor.call(this, 'MiniMap');

        this.scale = 200 / 800;
        this.w = this.scale * 800;
        this.h = this.scale * 600;

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
        this.y = 200;
    }, {

        render: function (ctx) {
            var self = this;

            this.renderMap(this.map);
            ctx.drawImage(this.map.canvas, this.x, this.y);

            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.stroke();
        },

        renderMap: function (ctx) {
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
                    x = Math.round(entity.x * self.scale);
                    y = Math.round(entity.y * self.scale);
                    r = Math.round(entity.radius * self.scale) || 1;

                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
            });
        },

        update: function (elapsed) {

        }
    });

    WinJS.Namespace.define('sidera', { MiniMap: MiniMap });
}());