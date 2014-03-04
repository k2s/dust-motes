/*globals dust, _console */
(function(dust) {
    dust.helpers.js = function(chunk, ctx, bodies, params) {
        // decide if we will use compiled expression cache stored in ctx.global
        var result, useCache = !!ctx.global.exprCache;

        // execute JavaScript expression in right context
        var jsEval = function(action) {
            var expr = dust.helpers.tap(params[action], chunk, ctx);

            try {
                // compile expression or use one cached in ctx.global
                var exprFunction;
                if (useCache && ctx.global.exprCache[expr]) {
                    exprFunction = ctx.global.exprCache[expr];
                } else {
                    //noinspection JSHint
                    exprFunction = new Function('ctx_', 'data_', 'with (ctx_.global) with (data_) return ' + expr);
                    if (useCache) {
                        ctx.global.exprCache[expr] = exprFunction;
                    }
                }
                return exprFunction.call(chunk, ctx, ctx.stack.head);
            } catch (e) {
                _console.log('jsEvalToFunction (' + expr + ') EXCEPTION ' + e);
                return undefined;
            }
        };

        // find out action type and process it
        if (params.hasOwnProperty('expr')) {
            result = jsEval('expr');
            return chunk.write(result);

        } else if (params.hasOwnProperty('for')) {
            var body = bodies.block;
            if (!body) {
                _console.log("Missing body block in the 'for' helper.");
                return chunk;
            }
            result = jsEval('for');
            if (result === null) {
                return chunk;
            } else if (result instanceof Array) {
                for (var i = 0; i < arr.length; i++) {

                }
            } else if (typeof result === 'object') {
                for (var key in result) {

                }
            } else {
                _console.log("Value '" + result + "' passed to 'for' helper has to be array or object.");
                return chunk;
            }

        } else if (params.hasOwnProperty('if')) {
            result = jsEval('if');
            if (result) {
                if (bodies.hasOwnProperty("block")) {
                    return chunk.render(bodies.block, ctx);
                } else {
                    _console.log("Missing body block in the if helper!");
                    return chunk;
                }
            } else if (bodies.hasOwnProperty('else')) {
                return chunk.render(bodies['else'], ctx);
            }

        } else if (params.hasOwnProperty('case')) {
            result = jsEval('case');
            if (bodies.hasOwnProperty(result)) {
                return chunk.render(bodies[result], ctx);
            } else {
                _console.log("Missing body block named '" + result + "' in the 'case' helper!");
            }
        }

        // not a valid action

        return chunk;
    };
})(typeof exports !== 'undefined' ? module.exports = require('dustjs-linkedin') : dust);
