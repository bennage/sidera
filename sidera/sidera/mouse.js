(function() {

	'use strict';

	var state = {
		x: -1,
		y: -1,
		buttonPressed: false,
		lastPressUp: new Date()
	};

	function getState() {
		return state;
	}

	function handle_mousedown(args) {
		state.buttonPressed = true;
	}

	function handle_mouseup(args) {
		state.buttonPressed = false;
		state.lastPressUp = new Date();
	}

	function handle_mousemove(args) {
		state.x = args.offsetX;
		state.y = args.offsetY;
	}

	function listen(target) {
		target.addEventListener('mousedown', handle_mousedown);
		target.addEventListener('mouseup', handle_mouseup);
		target.addEventListener('mousemove', handle_mousemove);
	}

	sidera.framework.namespace.define('sidera.mouse', {
		listen: listen,
		getState: getState
	});

}());