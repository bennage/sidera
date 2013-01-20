define(function(require) {

	var MapGrid = require('entities/MapGrid'),
		tween = require('animation/tween'),
		input = require('input/provider'),
		vector = require('math/vector'),
		geo = require('math/geometry');

	var Miner = require('entities/Miner'),
		Turret = require('entities/Turret'),
		Generator = require('entities/Generator');

	var menuWidth = 120;

	var Builder = function(camera, gameObjects, level) {
			this.camera = camera;
			this.gameObjects = gameObjects;
			this.level = level;

			this.cell = null;
			this.isValid = true;

			this.menu = {
				width: 0,
				grow: null,
				shrink: null
			};

			this.state = 'idle';
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

		switch(this.state) {
		case 'scanning':
			var coords = this.camera.project(this.cell);
			var size = (MapGrid.cellSize * this.camera.scale);

			ctx.save();

			ctx.fillStyle = this.isValid ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)';
			ctx.translate(coords.x, coords.y);
			ctx.fillRect(-size / 2, -size / 2, size, size);

			ctx.restore();
			break;

		case 'displaying':
		case 'dismissing':
			var coords = this.camera.project(this.cell);
			ctx.save();

			ctx.translate(coords.x, coords.y);

			ctx.fillStyle = 'rgba(200,200,200,0.7)';
			ctx.beginPath();
			ctx.arc(0, 0, this.menu.width, 0, Math.PI * 2, false);
			ctx.fill();

			// render buttons
			if(this.menu.width === menuWidth) {

				var third = Math.PI * 2 / 3;
				var sixth = third / 2;
				var pad = Math.PI * 2 / 180;

				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.fillStyle = 'rgba(255,0,0,1)';
				ctx.arc(0, 0, this.menu.width, pad, third - pad, false);
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.fillStyle = 'rgba(0,255,0,1)';
				ctx.arc(0, 0, this.menu.width, third + pad, 2 * third - pad, false);
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.fillStyle = 'rgba(0,0,255,1)';
				ctx.arc(0, 0, this.menu.width, 2 * third + pad, 3 * third - pad, false);
				ctx.fill();

				// labels
				ctx.fillStyle = 'black';
				ctx.font = '18px sans-serif';

				ctx.save();

				ctx.rotate(sixth);
				ctx.fillText('Generator', 20, 9);

				ctx.rotate(third);
				ctx.fillText('Miner', 20, 9);

				ctx.rotate(third);
				ctx.fillText('Turret', 20, 9);

				ctx.restore();
			}

			ctx.restore();
			break;
		}

	};

	Builder.prototype.update = function(elapsed) {

	    if(input.state.handled) {
	        this.state = 'idle';
	    }

	    switch(this.state) {
	        case 'idle':
	        this.idleUpdate(elapsed);
	        break;
		case 'scanning':
			this.scanningUpdate(elapsed);
			break;
		case 'displaying':
			this.displayingUpdate(elapsed);
			break;
		case 'dismissing':
			this.dismissingUpdate(elapsed);
			break;
		}

	};

	Builder.prototype.idleUpdate = function(elapsed) {

	    if(!input.state.handled && input.state.hasPointer && input.state.pointers.length === 1) {

	        var worldCoords = this.camera.toWorldSpace(input.state);
	        worldCoords.x = Math.round(worldCoords.x);
	        worldCoords.y = Math.round(worldCoords.y);

	        if(isInGameBounds(worldCoords)) {
	            this.cell = worldCoords;
	            this.state = 'scanning';
	            this.menu.grow = tween(0, menuWidth, 300, tween.smooth);

	            input.state.handled = true;
	        }

	    }
	};

	Builder.prototype.dismissingUpdate = function(elapsed) {
	    if(this.menu.width > 0) {
	        this.menu.width = this.menu.shrink(elapsed);
	    } else {
	        this.state = 'idle';
	    }
	};

	Builder.prototype.displayingUpdate = function(elapsed) {
		if(this.menu.width < menuWidth) {
			this.menu.width = this.menu.grow(elapsed);
		}

		if(input.state.hasPointer) {
			var origin = this.camera.project(this.cell);
			if(geo.lengthSquared(input.state, origin) > (menuWidth * menuWidth)) {
				this.state = 'dismissing';
				this.menu.shrink = tween(this.menu.width, 0, 300, tween.smooth);
			} else {
				var v = vector(origin, input.state);
				var third = Math.PI * 2 / 3;
				var entityType;

				var a = v.angle() - Math.PI; // off by 180 from the canvas arc()
				if(a < 0) a = (2 * Math.PI) + a; // normalize negative angles
				if(a < third) {
					entityType = Generator;
				} else if(a < 2 * third) {
					entityType = Miner;
				} else if(a < 3 * third) {
					entityType = Turret;
				} else {
					throw new Error('?');
				}

				if(!entityType.cost) throw new Error('no cost for unit: ' + entityType);

				if(this.level.money < entityType.cost) return;

				this.level.money -= entityType.cost;

				var entity = new entityType();
				entity.hydrate({
					x: this.cell.x,
					y: this.cell.y,
					context: this.level
				});

				this.gameObjects.friendlies.push(entity);

				this.state = 'dismissing';
				this.menu.shrink = tween(this.menu.width, 0, 300, tween.smooth);
			}
		}
	};

	Builder.prototype.scanningUpdate = function(elapsed) {

		if(!input.state.hasPointer) {
			this.state = this.isValid ? 'displaying' : 'idle';
		} else if(input.state.pointers.length === 1) {

			var worldCoords = this.camera.toWorldSpace(input.state);
			worldCoords.x = Math.round(worldCoords.x);
			worldCoords.y = Math.round(worldCoords.y);

			if(isInGameBounds(worldCoords)) {
				this.cell = worldCoords;

				this.isValid = !isOverEntity(worldCoords, this.gameObjects.friendlies) && !isOverEntity(worldCoords, this.gameObjects.enviroment);
				input.state.handled = true;
			}

		}

	};

	return Builder;

});