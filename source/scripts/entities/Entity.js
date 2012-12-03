define(['keyboard'], function(keyboard) {

    var Entity = function(type) {
            this.type = type;
            this.scale = 1;
            this.x = 0;
            this.y = 0;
            this.radius = 0;
            this.shoudExplode = false;

            keyboard.mixinKeyCheck(this);
        };

    // Copy the members to this
    Entity.prototype.hydrate = function(members) {
        for(var p in members) {
            if(members.hasOwnProperty(p)) {
                this[p] = members[p];
            }
        }
    };

    Entity.prototype.hit = function(damage) {
        if(!this.hp) return;
        this.hp -= damage;
        if(this.hp <= 0) {
            this.dead = true;
        }
    };

    // default render function
    Entity.prototype.render = function(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "10px sans-serif";
        ctx.fillText(this.type, this.x, this.y);
    };

    Entity.prototype.renderMeter = function(ctx, percent, color, offset, scale) {
        var height = 12 * scale;
        var width = 4 * scale;
        var amount = percent * height;
        var x = offset.x * scale;
        var y = offset.y * scale;

        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, width, height);
        ctx.fillRect(x, y + height - amount, width, amount);
    };

    Entity.prototype.canPlace = function(entities) {
        var self = this;
        // TODO: this is slow, replace with a for loop
        return !entities.some(function(entity) {
            var d = Math.sqrt(Math.pow(self.x - entity.x, 2) + Math.pow(self.y - entity.y, 2));
            return d < (self.radius + entity.radius);
        });
    };

    function mix(type, constructor, baseType) {

        function Entity() {
            baseType.prototype.constructor.call(this, type);
            constructor.prototype.constructor.apply(this, arguments);
        };

        Entity.type = type;
        Entity.mix = function(t, c) {
            return mix(t, c, Entity);
        };

        Object.keys(baseType.prototype).forEach(function(member) {
            Entity.prototype[member] = baseType.prototype[member];
        });

        return Entity;
    };

    Entity.mix = function(type, constructor) {
        return mix(type, constructor, Entity);
    };

    return Entity
});