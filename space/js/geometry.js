(function () {
    'use strict';

    var vector = space.vector;

    // float minimum_distance(vec2 v, vec2 w, vec2 p) {
    //   // Return minimum distance between line segment vw and point p
    //   const float l2 = length_squared(v, w);  // i.e. |w-v|^2 -  avoid a sqrt
    //   if (l2 == 0.0) return distance(p, v);   // v == w case
    //   // Consider the line extending the segment, parameterized as v + t (w - v).
    //   // We find projection of point p onto the line. 
    //   // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    //   const float t = dot(p - v, w - v) / l2;
    //   if (t < 0.0) return distance(p, v);       // Beyond the 'v' end of the segment
    //   else if (t > 1.0) return distance(p, w);  // Beyond the 'w' end of the segment
    //   const vec2 projection = v + t * (w - v);  // Projection falls on the segment
    //   return distance(p, projection);
    // }

    function dot(v, w) {
        return (v.x * w.x + v.y * w.y);
    }

    function point_over_line(v, w, p) {
        var l2 = Math.pow(vector(v, w).distance(), 2);
        if (l2 == 0.0) return false;
        var t = dot(vector(p, v), vector(w, v)) / l2;

        return (t >= 0.0 && t <= 1.0);
    }

    function intersect(line, circle) {
        var a = line[0],
            b = line[1];

        var p1_x = a.x - circle.x,
            p1_y = a.y - circle.y,
            p2_x = b.x - circle.x,
            p2_y = b.y - circle.y;

        var dx = p2_x - p1_x,
            dy = p2_y - p1_y,
            dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        var D = (p1_x * p2_y) - (p2_x * p1_y);

        var delta = Math.pow(circle.radius, 2) * Math.pow(dr, 2) - Math.pow(D, 2);

        return (delta >= 0);
    }

    WinJS.Namespace.define('space.geometry', {
        pointProjectsOntoSegment: point_over_line,
        lineIntersectsCircle: intersect
    });

}());