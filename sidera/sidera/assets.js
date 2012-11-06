(function() {
    'use strict';

    function load(complete, error, progress) {
        var total = this.files.length;
        var remaining = total;
        var store = this;
        var path = this.path;

        this.files.forEach(function(asset, index) {

            var img = new Image();
            img.src = path + asset;
            img.addEventListener('load', function() {
                remaining--;

                store[asset] = img;
                progress(1 - remaining/total);

                if(remaining === 0) {
                    complete();
                }
            });
        });
    }

    sidera.framework.namespace.define('sidera.assets', {
        load: load,
        path: 'images/',
        files: []
    });

}());