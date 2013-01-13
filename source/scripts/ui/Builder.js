define(function(require) {

	var MapGrid = require('entities/MapGrid'),
		input = require('input/provider');

	var Builder = function(camera, gameObjects) {
			this.camera = camera;
			this.gameObjects = gameObjects;
			this.cell = null;
			this.isValid = true;
		};

	function isInGameBounds(p) {
		return p.x >= 0 && p.x <= MapGrid.columns && p.y >= 0 && p.y <= MapGrid.rows;
	}

	function isOverEntity(p, blockers) {
		var i, entity;
		for(i = blockers.length - 1; i >= 0; i--) {
			entity = blockers[i];
			if(entity.x === p.x && entity.y === p.y) {
				return true;
			}
		}

		return false;
	}

	Builder.prototype.render = function(ctx) {

		if(this.cell === null) return;

		var coords = this.camera.project(this.cell);
		var size = (MapGrid.cellSize * this.camera.scale);

		ctx.save();

		ctx.fillStyle = this.isValid ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)';
		ctx.translate(coords.x, coords.y);
		ctx.fillRect(-size / 2, -size / 2, size, size);

		ctx.restore();
	};

	Builder.prototype.update = function() {
		this.cell = null;

		if(input.state.handled) return;

		if(input.state.pointers.length === 1) {
			var worldCoords = this.camera.toWorldSpace(input.state);
			worldCoords.x = Math.round(worldCoords.x);
			worldCoords.y = Math.round(worldCoords.y);

			if(isInGameBounds(worldCoords)) {
				this.cell = worldCoords;
				this.isValid = !isOverEntity(worldCoords, this.gameObjects.friendlies) && !isOverEntity(worldCoords, this.gameObjects.enviroment);
			}

		}
	};

	return Builder;

});