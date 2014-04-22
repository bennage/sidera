define(function () {

    // We're expecting that the render surface, that is the canvas,
    // will be sized to matched the height and width here.
    // If the scale is a value other than 1, it means that we're
    // stretching the canvas element.

    var aspectRatio = window.innerWidth / window.innerHeight;
    var renderWidth = Math.min(window.innerWidth, 1024);
    var renderHeight = (renderWidth / aspectRatio) + 1;

    var scale = 1;

    if (window.innerWidth > renderWidth) {
        scale = window.innerWidth / renderWidth;
    }

    return {
        height: renderHeight,
        width: renderWidth,
        aspectRatio: aspectRatio,
        scale: scale
    };

});