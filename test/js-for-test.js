/*global _console: true */
_console = console;
dust = require('dustjs-linkedin');
require('dustjs-helpers');
require('../src/helpers/control/js');
var assert = require('assert');

var sortObjDesc = function (old) {
    var n = {};
    Object.keys(old).sort().reverse().forEach(function (k) {
        n[k] = old[k]
    });
    return n;
};

var sortObjAsc = function (old) {
    var n = {};
    Object.keys(old).sort().forEach(function (k) {
        n[k] = old[k]
    });
    return n;
};

//var compareNumbers = function (a, b) {
//    var aa = parseInt(a, 10);
//    var bb = parseInt(b, 10);
//    return aa - bb;
//};

describe("@JS 'for' tests", function () {
    it('simple object iteration', function () {
        var context = { obj: {a: "A", b: "B", c: "C" } };
        var code = '{@js for="obj"}{$key}:{$value} {$type} {/js}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, 'a:A string b:B string c:C string ');
        });
    });
    it('iterate ascending sort', function () {
        var context = { obj: {c: "C", a: "A", b: "B" } };
        var base = dust.makeBase({"sortObjAsc": sortObjAsc});
        var code = '{@js for="sortObjAsc(obj)"}{$key}:{$value} {/js}';
        dust.renderSource(code, base.push(context), function (err, out) {
            assert.equal(out, 'a:A b:B c:C ');
        });
    });
    it('iterate descending sort', function () {
        var context = { obj: {c: "C", a: "A", b: "B" } };
        var base = dust.makeBase({"sortObjDesc": sortObjDesc});
        var code = '{@js for="sortObjDesc(obj)"}{$key}:{$value} {/js}';
        dust.renderSource(code, base.push(context), function (err, out) {
            assert.equal(out, 'c:C b:B a:A ');
        });
    });
    /*
    it('iterate no key param (doesn't work because of mocha ignoreLeaks: false)', function () {
        var context = { };
        var code = '{@js for="foo=1"}{$key}{/js}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, '');
        });
    });*/
    it('iterate helper pass array obj for key', function () {
        var context = {arr: [1, 2, 3]};
        var code = '{@js for="arr"}{$key}:{$value} {/js}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, '0:1 1:2 2:3 ');
        });
    });
    it('iterate helper pass string obj for key', function () {
        var context = {name: "dust"};
        var code = '{@js for="name"}{$key}:{$value} {/js}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, '0:d 1:u 2:s 3:t ');
        });
    });
    it('iterate with user-supplied compare function for numeric sort', function () {
        var context = { obj: {10: "C", 1: "A", 300: "B" } };
        // seams to work out of box without sorting
//        var base = dust.makeBase({"compareNumbers": compareNumbers});
//        sort="compareNumbers"
        var code = '{@js for="obj"}{$key}:{$value} {/js}';
        dust.renderSource(code, context /*base.push(context)*/, function (err, out) {
            assert.equal(out, '1:A 10:C 300:B ');
        });
    });
    it('iterate helper showing types', function () {
        var context = { obj: {a: "A", b: 2, c: [1, 2], d: {a: 4}, e: true, f: null, g: undefined, h: function f() {
        }} };
        var code = '{@js for="obj"}{$key} {$type} {/js}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, 'a string b number c object d object e boolean f object g undefined h function ');
        });
    });
});
