define(function() {

	var keys = {};
	var handle = {};
	
	function keydown(args) {
		keys[args.keyCode] = true;
	}

	function keyup(args) {
		keys[args.keyCode] = false;
	}

	function listen(target) {
	    target.addEventListener('keydown', keydown);
	    target.addEventListener('keyup', keyup);
	}

	function isKeyPressed(keyCode) {
		return keys[keyCode];
	}

	function isAnyKeyPressed() {
		return Object.keys(keys).some(function(key) {
			return keys[key];
		});
	}

	function checkCommands() {
		var self = this;
		Object.keys(self.commands).forEach(function(key) {
			if(handle.isKeyPressed(key)) {
				self.commands[key]();
			}
		});
	}

	function createCommandFrom(definition, target) {

	    var delay = definition.delay || 300;
	    var command = definition.command.bind(target);

	    var f = function () {
	        var now = new Date();
	        var elasped = now - f.lastInvoked;
	        if (elasped > delay) {
	            command(elasped);
	            f.lastInvoked = now;
	        }
	    };
	    f.lastInvoked = new Date();

	    return f;
	}

	function mixinKeyCheck(target) {

	    if (!target.commands) {
	        return;
	    }

	    // bind commands to target
	    Object.keys(target.commands).forEach(function (key) {
	        var definition = target.commands[key];

	        if (definition instanceof Function) {
	            target.commands[key] = definition.bind(target);
	        } else {
	            target.commands[key] = createCommandFrom(definition, target);
	        }
	    });

	    // associate bound instance of method to detect keypresses
	    target.checkCommands = checkCommands.bind(target);
	}

	handle = {
		isKeyPressed: isKeyPressed,
		isAnyKeyPressed: isAnyKeyPressed,
		listen: listen,
		mixinKeyCheck: mixinKeyCheck
	};

	return handle;

});