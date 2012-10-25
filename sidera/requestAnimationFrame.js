(function() {

    // Ensure that the `requestAnimationFrame` API is present as expected

   var lastTime = 0;
   var vendors = ['ms', 'moz', 'webkit', 'o'];
   for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
       window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
       window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
   }

   // if we are on a browser that doesn't implement requestAnimationFrame, we create our own 
   // using setTimeout
   if(!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
       var currTime = new Date().getTime();
       var timeToCall = Math.max(0, 16 - (currTime - lastTime));
       var id = window.setTimeout(function() {
           callback(currTime + timeToCall);
       }, timeToCall);
       lastTime = currTime + timeToCall;
       return id;
   };

   // if we are on a browser that doesn't implement cancelAnimationFrame, we create our own 
   // using clearTimeout
   if(!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
       window.clearTimeout(id);
   };

}());