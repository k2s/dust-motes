/*globals dust, _console */
(function (dust) {
    dust.helpers.js = function (chunk, ctx, bodies, params) {
        // decide if we will use compiled expression cache stored in ctx.global
        var result, useCache = !!ctx.global.exprCache;

        /**
         * Evaluate expression in default JavaScript way
         *
         * @param action
         * @returns {*}
         */
        var jsEvalPure = function (action) {
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
                var loopData = {};
                if (ctx.stack.hasOwnProperty('index')) {
                    loopData.$idx = ctx.stack.index;
                    loopData.$len = ctx.stack.of;
                }
                var data = ctx.stack.isObject ? ctx.stack.head : {};
                data.$this = ctx.stack.head;
                return exprFunction.call(chunk, ctx, data, loopData);
            } catch (e) {
                _console.log('jsEvalToFunction (' + expr + ') EXCEPTION ' + e);
                return undefined;
            }
        };

        /**
         * Evaluate expression with handling of unknown variable names
         *
         * @param action
         * @returns {*}
         */
        var jsEvalHandleUnknown = function (action) {
            var expr = dust.helpers.tap(params[action], chunk, ctx);
            var unknownVars = {}, repeat;

            do {
                repeat = false;
                try {
                    // compile expression or use one cached in ctx.global
                    var exprFunction;
                    if (!repeat && useCache && ctx.global.exprCache[expr]) {
                        exprFunction = ctx.global.exprCache[expr];
                    } else {
                        // build fix for JavaScript undefined exceptions
                        var fixes = "var fixes_ = {};";
                        for (var v in unknownVars) {
                            fixes += 'if (typeof ' + v + ' ==="undefined") fixes_.' + v + '=null;';
                        }
                        fixes += "with(fixes_){";
                        //noinspection JSHint
                        exprFunction = new Function('ctx_', 'data_', 'loopData_', "with (ctx_.global) with (data_) with (loopData_) {" + fixes + 'return ' + expr + '}}');
                        if (useCache) {
                            ctx.global.exprCache[expr] = exprFunction;
                        }
                    }
                    var loopData = {};
                    if (ctx.stack.hasOwnProperty('index')) {
                        loopData.$idx = ctx.stack.index;
                        loopData.$len = ctx.stack.of;
                    }
                    var data = ctx.stack.isObject ? ctx.stack.head : {};
                    data.$this = ctx.stack.head;
                    return exprFunction.call(chunk, ctx, data, loopData);
                } catch (e) {
                    if (e.name === 'ReferenceError') {
                        var a = e.message.match(/^(\w*)/);
                        unknownVars[a[0]] = null;
                        repeat = true;
                    } else {
                        _console.log('jsEvalToFunction (' + expr + ') EXCEPTION ' + e);
                        return undefined;
                    }
                }
            } while (repeat);
        };

        // decide what evaluation function to use
        var jsEval = jsEvalHandleUnknown;
        var value;

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
            } else if (result instanceof Array || typeof result === "string") {
                for (var i = 0; i < result.length; i++) {
                    value = result[i];
                    chunk = body(chunk, ctx.push({
                        $key: i,
                        $value: value,
                        $type: typeof value
                    }));
                }
            } else if (typeof result === 'object') {
                for (var key in result) {
                    if (result.hasOwnProperty(key)) {
                        value = result[key];
                        chunk = body(chunk, ctx.push({
                            $key: key,
                            $value: value,
                            $type: typeof value
                        }));
                    }
                }
            } else {
                _console.log("Value '" + result + "' passed to 'for' helper has to be array or object.");
                return chunk;
            }

        } else if (params.hasOwnProperty('if')) {
            result = jsEval('if');
            if (result === undefined && bodies.hasOwnProperty("unknown")) {
                // @if returns empty string for unknown,
                // but we do evaluate to false if :unknown block is not defined
                return chunk.render(bodies['unknown'], ctx);
            } else if (result) {
                if (bodies.hasOwnProperty("block")) {
                    return chunk.render(bodies.block, ctx);
                } else {
                    _console.log("Missing body block in the if helper!");
                    return chunk;
                }
            } else if (bodies.hasOwnProperty('else')) {
                return chunk.render(bodies['else'], ctx);
            }

        } else if (params.hasOwnProperty('switch')) {
            result = jsEval('switch');
            if (bodies.hasOwnProperty(result)) {
                return chunk.render(bodies[result], ctx);
            } else {
                if (bodies.hasOwnProperty("else")) {
                    return chunk.render(bodies['else'], ctx);
                } else {
                    _console.log("Missing body block named '" + result + "' in the 'case' helper!");
                }
            }
        }

        // not a valid action

        return chunk;
    };
})(typeof exports !== 'undefined' ? module.exports = require('dustjs-linkedin') : dust);
