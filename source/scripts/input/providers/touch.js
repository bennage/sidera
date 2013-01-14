define(function() {

    var state = {
        x: -1,
        y: -1,
        pointers: [],
        hasPointer: false
    };

    // touch event handlers
    function hande_touchstart(args) {
        state.pointers.push({
            x: args.x,
            y: args.y,
            id: args.pointerId
        });

        if(args.isPrimary) {
            state.x = args.x;
            state.y = args.y;
        }

        state.hasPointer = true;
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
            state.hasPointer = false;
        }
    }

    function handle_touchcancel(args) {
        debugger;
        removePointer(args.pointerId);
    }

    function handle_touchend(args) {
        removePointer(args.pointerId);
    }

    // mouse event handlers
    function handle_mousedown(args) {
        state.pointers.push({
            x: args.offsetX,
            y: args.offsetY,
            id: 'mouse'
        });

        state.x = args.offsetX;
        state.y = args.offsetY;

        state.hasPointer = true;
    }

    function handle_mouseup(args) {
        removePointer('mouse');
    }

    function handle_mousemove(args) {
        state.x = args.offsetX;
        state.y = args.offsetY;
    }

    // pubic
    function getState() {
        return state;
    }

    function listen(target) {
        target.addEventListener('touchstart', hande_touchstart, false);
        target.addEventListener('touchend', handle_touchend, false);
        target.addEventListener('touchcancel', handle_touchcancel, false);

        target.addEventListener('mousedown', handle_mousedown);
        target.addEventListener('mouseup', handle_mouseup);
        target.addEventListener('mousemove', handle_mousemove);
    }

    return {
        listen: listen,
        getState: getState
    };

});