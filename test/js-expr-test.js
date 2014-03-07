/*global _console: true */
_console = console;
dust = require('dustjs-linkedin');
require('dustjs-helpers');
require('../src/helpers/control/js');
var moment = require('moment');
var assert = require('assert');


describe("@JS 'expr' tests", function () {
    it('simple variable', function () {
        var context = { v: "A"};
        var code = '{@js expr="v" /}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, 'A');
        });
    });
    it('little bit of math', function () {
        var context = {};
        var code = '{@js expr="2*2" /}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, '4');
        });
    });
    it('use moment library', function () {
        var context = {moment:moment};
        var code = '{@js expr="moment(\'Dec 25, 1995\').format(\'DD.MM.YYYY\')" /}';
        dust.renderSource(code, context, function (err, out) {
            assert.equal(out, '25.12.1995');
        });
    });
});
