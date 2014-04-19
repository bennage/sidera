define(function () {

    var aspectRatio = window.innerWidth / window.innerHeight;
    var renderWidth = Math.min(window.innerWidth, 1024);
    var renderHeight = (renderWidth / aspectRatio) + 1;

    return {
        height: renderHeight,
        width: renderWidth,
        aspectRatio: aspectRatio
    };

});