(function() {
    'use strict';

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.addEventListener('activated', function(args) {
        if(args.detail.kind === activation.ActivationKind.launch) {
            if(args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll().then(function() {

                require(['bootstrap'])(['bootstrap'], function(bootstrap) {
                    bootstrap();
                });
            }));
        }
    });

    app.addEventListener('checkpoint', function(args) {
        //TODO
    });

    app.start();

}());