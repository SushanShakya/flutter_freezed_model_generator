"use strict";
exports.__esModule = true;
var assert = require("assert");
// import * as myExtension from '../../extension';
var freezed_class_1 = require("../../templates/freezed_class");
suite('Freezed Class Tests', function () {
    test('getFreezedClass() Test', function () {
        var s = freezed_class_1.getClassTemplate('HelloWorld', '');
        console.log(s);
        var req = "class HelloWorld with _$HelloWorld {\n\tconst factory HelloWorld({\n\t\t\n\t}) = _HelloWorld;\n}";
        assert.strictEqual(s, req);
    });
});
