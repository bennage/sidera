define(function(require) {

	function tweening(start, end, duration, ease) {
		var total = 0;
		var delta = end - start;

		return function(elapsed) {
			total += elapsed;
			return(total >= duration) ? end : ease(start, delta, duration, total);
		};
	}

	tweening.smooth = function(start, delta, duration, time) {
		// todo: replace with something better
		return start + delta * (time / duration);
	}

	return tweening;

});