(function() {

	'use strict';

	var Entity = sidera.entities.Entity,
		Miner = sidera.entities.Miner,
		Turret = sidera.entities.Turret,
		Generator = sidera.entities.Generator;

	var commandButtonHeight = 48;
	var commandButtonWidth = 84;
	var padding = 8;

	function intializeCommand(command, index) {
		command.top = padding + (index * commandButtonHeight);
		command.left = padding;
		command.bottom = command.top + commandButtonHeight;
		command.right = padding + commandButtonWidth;
		command.active = false;
		command.label = new command.action().type;
	}

	var CommandBar = sidera.framework.class.derive(Entity, function() {

		Entity.prototype.constructor.call(this, 'CommandBar');

		this.commands = [{
			key: 49,
			action: Miner
		}, {
			key: 50,
			action: Generator
		}, {
			key: 51,
			action: Turret
		}];

		this.commands.forEach(intializeCommand);

		this.height = this.commands.length * commandButtonHeight + padding + padding;
		this.width = commandButtonWidth + padding + padding;

		this.x = sidera.resolution.width - this.width;
		this.y = 50;

		this.bounds = {
			top: this.y,
			left: this.x,
			bottom: this.y + this.height,
			right: this.x + this.width
		};

	}, {
		on: true,
		state: null,
		handleMouse: function(mouseState) {
			if(!this.on) {
				return false;
			}

			var command, index;
			for(index = this.commands.length - 1; index >= 0; index--) {
				command = this.commands[index];
				command.active = mouseState.isCursorOver({
					top: this.bounds.top + command.top,
					left: this.bounds.left + command.left,
					bottom: this.bounds.top + command.bottom,
					right: this.bounds.left + command.right
				});

				if(command.active && mouseState.buttonPressed) {
					console.log('execute ' + command.label);
				}
			};

			return true;
		},
		render: function(ctx) {
			var command, index;

			ctx.save();
			ctx.translate(this.x, this.y);

			ctx.beginPath();
			ctx.rect(0, 0, this.width, this.height);
			ctx.fillStyle = 'rgb(128,128,128)';
			ctx.fill();

			for(index = this.commands.length - 1; index >= 0; index--) {
				command = this.commands[index];

				ctx.beginPath();
				ctx.rect(command.left, command.top, commandButtonWidth, commandButtonHeight);
				ctx.fillStyle = (command.active) ? 'rgb(0,128,0)' : 'rgb(0,0,0)';
				ctx.fill();

				ctx.fillStyle = "white";
				ctx.font = "14px sans-serif";
				ctx.fillText(command.label, padding, command.top + padding + padding);
			}

			ctx.restore();
		},
		update: function() {

		}
	});

	sidera.framework.namespace.define('sidera.ui', {
		CommandBar: CommandBar
	});

}());