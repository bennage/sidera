(function() {

	'use strict';

	function handle_keydown(args) {
		keys[args.keyCode] = true;
	}

	function handle_keyup(args) {
		keys[args.keyCode] = false;
	}

	function listen(target) {
		target.addEventListener('keydown', handle_keydown);
		target.addEventListener('keyup', handle_keyup);
	}

	function isKeyPressed(keyCode) {
		return keys[keyCode];
	}

	function isAnyKeyPressed() {
		return Object.keys(keys).some(function(key) {
			return keys[key];
		});
	}

	var keys = {};

	function checkCommands() {
		var self = this;
		Object.keys(self.commands).forEach(function(key) {
			if(sidera.keyboard.isKeyPressed(key)) {
				self.commands[key]();
			}
		});
	}

	function mixinKeyCheck(target) {

		if(!target.commands) {
			return;
		}

		// bind commands to target
		Object.keys(target.commands).forEach(function(key) {
			target.commands[key] = target.commands[key].bind(target);
		});

		// associate bound instance of method to detect keypresses
		target.checkCommands = checkCommands.bind(target);
	}

	sidera.framework.namespace.define('sidera.keyboard', {
		isKeyPressed: isKeyPressed,
		isAnyKeyPressed: isAnyKeyPressed,
		listen: listen,
		mixinKeyCheck: mixinKeyCheck
	});

}());