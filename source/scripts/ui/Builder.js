define(function(require) {

	var MapGrid = require('entities/MapGrid'),
		tween = require('animation/tween'),
		input = require('input/provider');

	var menuWidth = 100;

	var Builder = function(camera, gameObjects) {
			this.camera = camera;
			this.gameObjects = gameObjects;
			this.cell = null;
			this.isValid = true;

			this.resetMenu();
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

		if(this.cell !== null) {
			var coords = this.camera.project(this.cell);
			var size = (MapGrid.cellSize * this.camera.scale);

			ctx.save();

			ctx.fillStyle = this.isValid ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)';
			ctx.translate(coords.x, coords.y);
			ctx.fillRect(-size / 2, -size / 2, size, size);

			ctx.restore();

		} else if(this.displayMenuAt != null) {

			var coords = this.camera.project(this.displayMenuAt);
			ctx.save();

			ctx.fillStyle = 'rgba(0,0,255,0.7)';
			ctx.translate(coords.x, coords.y);
			ctx.beginPath();
			ctx.arc(0, 0, this.menu.width, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.restore();
		}

	};

	Builder.prototype.update = function(elapsed) {
		var lastCell = this.cell;
		this.cell = null;

		if(input.state.handled) return;

		if(this.displayMenuAt) {
			if(this.menu.width < menuWidth) {
				this.menu.width = this.menu.tween(elapsed);
			}

		}

		if(this.isValid && !input.state.hasPointer && lastCell !== null) {
			this.displayMenuAt = lastCell;
		} else if(input.state.pointers.length === 1) {

			var worldCoords = this.camera.toWorldSpace(input.state);
			worldCoords.x = Math.round(worldCoords.x);
			worldCoords.y = Math.round(worldCoords.y);

			this.resetMenu();

			if(isInGameBounds(worldCoords)) {
				this.cell = worldCoords;

				this.isValid = !isOverEntity(worldCoords, this.gameObjects.friendlies) && !isOverEntity(worldCoords, this.gameObjects.enviroment);
				input.state.handled = true;
			}

		}
	};

	Builder.prototype.resetMenu = function() {
		this.displayMenuAt = null;
		this.menu = {
			width: 0,
			tween: tween(0, menuWidth, 300, tween.smooth)
		};

	};

	return Builder;

});