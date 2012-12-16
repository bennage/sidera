define(function(require) {

    var Entity = require('entities/Entity');

    var padding = 0.5;

    var MapGrid = Entity.mix('MapGrid', function() {
        this.x = 0;
        this.y = 0;
    });

    MapGrid.prototype.update = function() { };

    MapGrid.prototype.render = function(ctx, camera) {

        var start, end;
        var r, c;

        ctx.strokeStyle = 'hsl(120,50%,10%)';
        ctx.lineWidth = 1;

        // horizontal lines
        for(r = -1; r <= MapGrid.rows; r++) {

            start = camera.project({
                x: -padding,
                y: r + padding
            });
            end = camera.project({
                x: MapGrid.columns + padding,
                y: r + padding
            });

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        // vertical lines
        for(c = -1; c <= MapGrid.columns; c++) {

            start = camera.project({
                x: c + padding,
                y: -padding
            });
            end = camera.project({
                x: c + padding,
                y: MapGrid.rows + padding
            });

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

    };

    MapGrid.columns = 30;
    MapGrid.rows = 30;
    MapGrid.cellSize = 30;

    return MapGrid;
});