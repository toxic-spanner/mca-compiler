var errors = require('../errors');

function Block(overloads) {
    this.isBlock = true;
    this.overloads = overloads;
}

Block.prototype.hasOverload = function(name) {
    return this.overloads.hasOwnProperty(name);
};

Block.prototype.getOverload = function(name) {
    var overload = this.overloads[name];

    return {
        execute: function(ctx, params) {
            var result = null;

            ctx.pushScope();
            for (var i = 0; i < params.length; i++) {
                var paramDef = overload.params[i];

                var param = params[i];
                if (param && (param.isAssignable || paramDef.type === "OutIdentifier") && param.isAssignable !== (paramDef.type === "OutIdentifier")) {
                    errors.callError("Both macro definition and call must specify 'out'");
                }

                ctx.setVariable(paramDef.name, params[i], 0);
            }

            if (overload.block.type === "BlockBodyStatement") {
                var ex = ctx.executor.execute(overload.block, ctx);
                ctx.executor.pushNodeStack({
                    'ReturnStatement': function(node) {
                        if (node.argument) result = ctx.executor.execute(node.argument, ctx).start();
                        ex.stop();
                    }
                });
                ex.start();
                ctx.executor.popNodeStack();
            } else result = ctx.executor.execute(overload.block, ctx).start();

            ctx.popScope();
            return result;
        }
    };
};

Block.type = "block";
Block.matches = function(block) {
    return block && block.isBlock;
};
Block.equal = function(block1, block2) {
    return block1 === block2;
};
Block.cast = {
    boolean: function(block) {
        return true;
    }
};
module.exports = Block;