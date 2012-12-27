define(function(require) {

    var provider;

    function isCursorOver(bounds) {
        return (state.x >= bounds.left) && (state.x <= bounds.right) && (state.y >= bounds.top) && (state.y <= bounds.bottom);
    }

    if(window.navigator.msPointerEnabled) {
        // IE10 support
        provider = require('input/providers/pointers');
    } else {
        provider = require('input/providers/touch');
    }

    return provider;

});