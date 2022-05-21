"use strict";
exports.__esModule = true;
exports.extractFields = exports.getClassTemplate = void 0;
function getClassTemplate(name, fields) {
    return "class " + name + " with _$" + name + " {\n    const factory " + name + "({\n" + fields + "\n    }) = _" + name + ";\n\n    factory " + name + ".fromJson(Map<String, dynamic> json) => _" + name + "FromJson(json);\n}";
}
exports.getClassTemplate = getClassTemplate;
function getFieldTemplate(variableName, variableType) {
    return variableType + "? " + variableName + ",";
}
function extractJSON(json) {
}
function extractFields(json) {
}
exports.extractFields = extractFields;
