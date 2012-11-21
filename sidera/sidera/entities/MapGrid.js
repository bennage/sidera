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

			var start, end;
			var r, c;

			ctx.strokeStyle = 'hsl(120,50%,10%)';
			ctx.lineWidth = 1;

			// horizontal lines
			for(r = 0; r <= MapGrid.rows; r++) {

				start = camera.project({
					x: 0,
					y: r
				});
				end = camera.project({
					x: MapGrid.columns,
					y: r
				});

				ctx.beginPath();
				ctx.moveTo(start.x, start.y);
				ctx.lineTo(end.x, end.y);
				ctx.stroke();
			}

			// vertical lines
			for(c = 0; c <= MapGrid.columns; c++) {

				start = camera.project({
					x: c,
					y: 0
				});
				end = camera.project({
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