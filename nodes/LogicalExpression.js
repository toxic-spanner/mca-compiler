exports.type = "LogicalExpression";
exports.call = function(node, ctx, execute) {
    return ctx.operate(node.operator, node.left, node.right);
};