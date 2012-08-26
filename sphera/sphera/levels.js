/// <reference path="Asteroid.js" />
(function () {

    'use strict';

    var Asteroid = sphera.entities.Asteroid;

    function next(objects, bounds) {
        var r = Math.random;
        var asteroid_count = 15;

        while (asteroid_count > 0) {
            var a = new Asteroid();
            a.x = parseInt(r() * bounds.width, 10);
            a.y = parseInt(r() * bounds.height, 10);
            a.amount = parseInt(r() * 2000, 10) + 200;
            objects.enviroment.push(a);
            asteroid_count--;
        }
    }

    //function loadLevel(done) {
    //    console.log('load level');
    //    var request = new XMLHttpRequest();
    //    request.open('GET', '/level.json', false);
    //    request.send(null);

    //    if (request.status === 200) {
    //        var responseText = JSON.stringify({
    //            'things': [{
    //                'type': 'asteroid',
    //                'x': 100,
    //                'y': 100,
    //                'amount': 1000
    //            }, {
    //                type: 'asteroid',
    //                x: 300,
    //                y: 100,
    //                amount: 500
    //            }]
    //        });
    //        //var data = JSON.parse(request.responseText);
    //        var data = JSON.parse(responseText);
    //        money = 1000;
    //        data.things.forEach(function (x) {
    //            var a = new Asteroid();
    //            a.hydrate(x);
    //            entities.push(a);
    //        });
    //    }
    //}

    WinJS.Namespace.define('sphera.levels', {
        next: next
    });

}());