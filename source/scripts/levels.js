﻿define(function(require) {

    var MapGrid = require('entities/MapGrid'),
        Asteroid = require('entities/Asteroid');

    var state = {
        money: 10000
    };

    function next(objects) {
        var r = Math.random;
        var asteroid_count = 35;

        while(asteroid_count > 0) {
            var a = new Asteroid();
            a.x = parseInt(r() * MapGrid.columns, 10);
            a.y = parseInt(r() * MapGrid.rows, 10);
            a.amount = parseInt(r() * 2000, 10) + 200;
            objects.enviroment.push(a);
            asteroid_count--;
        }

        var a = new Asteroid();
        a.x = 0;
        a.y = 0;
        a.amount = 2000;
        objects.enviroment.push(a);

        var a = new Asteroid();
        a.x = 1;
        a.y = 1;
        a.amount = 2000;
        objects.enviroment.push(a);

        var a = new Asteroid();
        a.x = MapGrid.columns;
        a.y = MapGrid.rows;
        a.amount = 2000;
        objects.enviroment.push(a);

        return state;
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
    return {
        next: next,
        current: state
    };

});