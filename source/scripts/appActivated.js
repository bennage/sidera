define(function () {
    'use strict';

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var isReady = false;
    var readyCalls = [];

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](doc);
        }
    }

    app.addEventListener('activated', function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                isReady = true;
                if (readyCalls.length) {
                    runCallbacks(readyCalls);
                }
            }));
        }
    });

    app.addEventListener('checkpoint', function (args) {

    });



    function appActivated(callback) {
        if (isReady) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return appActivated;
    }

    appActivated.version = '0.0.1';

    /**
     * Loader Plugin API method
     */
    appActivated.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            appActivated(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return appActivated;
});
