(function() {

	'use strict';

	var Entity = sidera.entities.Entity;

	var MapGrid = sidera.framework.class.derive(Entity, function() {
		Entity.prototype.constructor.call(this, 'MapGrid');

		this.x = 0;
		this.y = 0;

	}, {
		update: function() {},
		render: function(ctx, camera) {
			var cellSize = MapGrid.cellSize * camera.scale();
			var width = MapGrid.columns * cellSize;
			var height = MapGrid.rows * cellSize;

			var offsetX = camera.bounds.left;
			var offsetY = camera.bounds.top;

			ctx.strokeStyle = 'hsl(120,50%,10%)';
			ctx.lineWidth = 1;

			var extentY, extentX;

			// horizontal
			for(var r = 0; r <= MapGrid.rows; r++) {

				extentY = r * cellSize + offsetY;

				var start = camera.project({
					x: 0,
					y: r
				});
				var end = camera.project({
					x: MapGrid.columns,
					y: r
				});

				ctx.beginPath();
				ctx.moveTo(start.x, start.y);
				ctx.lineTo(end.x, end.y);
				ctx.stroke();
			}

			// vertical
			for(var c = 0; c <= MapGrid.columns; c++) {

				extentX = c * cellSize + offsetX;

				var start = camera.project({
					x: c,
					y: 0
				});
				var end = camera.project({
					x: c,
					y: MapGrid.rows
				});

				ctx.beginPath();
				ctx.moveTo(start.x, start.y);
				ctx.lineTo(end.x, end.y);
				ctx.stroke();
			}
		}
	}, {
		columns: 30,
		rows: 30,
		cellSize: 30,
	});

	sidera.framework.namespace.define('sidera.entities', {
		MapGrid: MapGrid
	});


}());