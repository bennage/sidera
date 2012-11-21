(function() {

	'use strict';

	function handle_keydown(args) {
		keys[args.keyCode] = true;
	}

	function handle_keyup(args) {
		keys[args.keyCode] = false;
	}

	function listen() {
		window.addEventListener('keydown', handle_keydown);
		window.addEventListener('keyup', handle_keyup);
	}

	function isKeyPressed(keyCode) {
		return keys[keyCode];
	}

	var keys = {};

	sidera.framework.namespace.define('sidera.keyboard', {
		isKeyPressed: isKeyPressed,
		listen: listen
	});

}());