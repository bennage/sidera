(function() {
    'use strict';

    var global = window;

    function define_namespace(path, members) {
        var steps = path.split('.');
        var step;
        var current = global;
        for(var i = 0; i < steps.length; i++) {
            step = steps[i];
            if(!current[step]) {
                current[step] = {};
            }
            current = current[step];
        }
        _.merge(current, members);
    }

    function define_class(constructor, members, typeMembers) {
        _.merge(constructor.prototype, members);
        _.merge(constructor, typeMembers);
        return constructor;
    }

    function derive_class(baseConstructor, constructor, members, typeMembers) {
        _.merge(constructor.prototype, baseConstructor.prototype);
        _.merge(constructor.prototype, members);
        _.merge(constructor, typeMembers);
        return constructor;
    }

    define_namespace('sidera.framework.namespace', {
        define: define_namespace
    });

    define_namespace('sidera.framework.class', {
        define: define_class,
        derive: derive_class
    });

})();