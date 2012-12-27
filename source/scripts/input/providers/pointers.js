define(function() {

    var state = {
        x: -1,
        y: -1,
        pointers: [],
        hasPoint: false
    };

    function handle_down(evt) {
        state.pointers.push({
            x: evt.x,
            y: evt.y,
            id: evt.pointerId
        });

        if(evt.isPrimary) {
            state.x = evt.x;
            state.y = evt.y;
        }

        state.hasPoint = true;
    }

    function removePointer(pointerId) {
        var l = state.pointers.length;

        for(var i = l - 1; i >= 0; i--) {
            if(state.pointers[i].id === pointerId) {
                state.pointers.splice(i, 1);
                break;
            }
        }

        if(state.pointers.length === 0) {
            state.hasPoint = false;
        }
    }

    function handle_cancel(evt) {
        debugger;
        removePointer(evt.pointerId);
    }

    function handle_up(evt) {
        removePointer(evt.pointerId);
    }

    function getState() {
        return state;
    }

    function listen(target) {
        target.addEventListener('MSPointerDown', handle_down);
        target.addEventListener('MSPointerUp', handle_up);
        target.addEventListener('MSPointerCancel', handle_cancel);
    }

    return {
        listen: listen,
        getState: getState
    };

});