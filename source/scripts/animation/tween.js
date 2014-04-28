define(function (require) {

    function tweening(start, end, duration, ease) {
        var total = 0;
        var delta = end - start;

        // setup the tween function to be returned
        var tween = function (elapsed) {
            var current;

            total += elapsed;

            if (total >= duration) {
                tween.finished = true;
                current = end;
            } else {
                current = ease(start, delta, duration, total);
            }
            return current;
        };

        // initialize the tween's state
        tween.finished = false;

        return tween;
    }

    tweening.smooth = function (start, delta, duration, time) {
        // todo: replace with something better
        return start + delta * (time / duration);
    }

    return tweening;

});