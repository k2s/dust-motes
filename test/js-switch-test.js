/*global _console: true */
_console = console;
dust = require('dustjs-linkedin');
require('dustjs-helpers');
require('../src/helpers/control/js');
var assert = require('assert');

describe("@JS 'switch' tests", function () {
    it('first block', function () {
        var code = '{@js switch="v"}{:a}a{:b}b{/js}';
        dust.renderSource(code, {v: "a"}, function (err, out) {
            assert.equal(out, 'a');
        });
    });
    it('second block', function () {
        var code = '{@js switch="v"}{:a}a{:b}b{/js}';
        dust.renderSource(code, {v: "b"}, function (err, out) {
            assert.equal(out, 'b');
        });
    });
    it("doesn't match", function () {
        var code = '{@js switch="v"}{:a}a{:b}b{/js}';
        dust.renderSource(code, {v: "c"}, function (err, out) {
            assert.equal(out, '');
        });
    });
    it("doesn't match, but has else", function () {
        var code = '{@js switch="v"}{:a}a{:b}b{:else}else{/js}';
        dust.renderSource(code, {v: "c"}, function (err, out) {
            assert.equal(out, 'else');
        });
    });
});
