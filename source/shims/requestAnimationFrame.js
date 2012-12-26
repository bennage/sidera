(function() {
    'use strict';

  // RequestAnimationFrame Shim
  // --------------------------

  // This code is derived from the starter framework discussed on:
  // http://www.contrejour.ie/BehindTheScenes.html
  // The direct link to download the kit is
  // http://www.contrejour.ie/downloads/HTML5GameKit.zip
  // Ensure that the `requestAnimationFrame` API is present as expected.

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  // We'll iterate over known vendor prefixes and alias them to the
  // primary names for the API.
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  // If `requestAnimationFrame` is not implemented create it using `setTimeout`.
  if(!window.requestAnimationFrame) {

    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  }

  // If `cancelAnimationFrame` is not implemented create it using `clearTimeout`.
  if(!window.cancelAnimationFrame) {

    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };

  }

}());